package main

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"syscall"
)

type WailsConfig struct {
	Info struct {
		ProductVersion string `json:"productVersion"`
	} `json:"info"`
}

type App struct {
	ctx     context.Context
	version string
}

type NetAdapter struct {
	Name          string   `json:"name"`
	InterfaceDesc string   `json:"interfaceDesc"`
	Status        string   `json:"status"`
	MacAddress    string   `json:"macAddress"`
	Speed         string   `json:"speed"`
	IPv4          []string `json:"ipv4"`
	IPv6          []string `json:"ipv6"`
	Gateway       []string `json:"gateway"`
	DNS           []string `json:"dns"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.loadVersion()
}

func (a *App) loadVersion() {
	data, err := os.ReadFile("wails.json")
	if err != nil {
		return
	}

	var config WailsConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return
	}

	a.version = config.Info.ProductVersion
}

func (a *App) GetAdapters() ([]NetAdapter, error) {
	psScript := `
	$ErrorActionPreference = 'SilentlyContinue'
	[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
	
	$adapters = Get-NetAdapter
	$ips = Get-NetIPAddress
	$dnsList = Get-DnsClientServerAddress -AddressFamily IPv4
	$routes = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -AddressFamily IPv4

	$result = foreach ($a in $adapters) {
		$idx = $a.InterfaceIndex
		
		$v4 = @(($ips | Where-Object { $_.InterfaceIndex -eq $idx -and $_.AddressFamily -eq 'IPv4' }).IPAddress)
		$v6 = @(($ips | Where-Object { $_.InterfaceIndex -eq $idx -and $_.AddressFamily -eq 'IPv6' }).IPAddress)
		$dns = @(($dnsList | Where-Object { $_.InterfaceIndex -eq $idx }).ServerAddresses)
		$gw = @(($routes | Where-Object { $_.InterfaceIndex -eq $idx }).NextHop)

		$finalSpeed = $a.LinkSpeed
		if ([string]::IsNullOrWhiteSpace($finalSpeed) -and $a.Speed -gt 0) {
			$finalSpeed = "$([math]::Round($a.Speed / 1MB)) Mbps"
		}
		if ([string]::IsNullOrWhiteSpace($finalSpeed)) { $finalSpeed = "N/A" }

		[PSCustomObject]@{
			name = $a.Name
			interfaceDesc = $a.InterfaceDescription
			status = $a.Status
			macAddress = $a.MacAddress
			speed = $finalSpeed
			ipv4 = $v4
			ipv6 = $v6
			gateway = $gw
			dns = $dns
		}
	}
	
	@($result) | ConvertTo-Json -Depth 4 -Compress
	`

	cmd := exec.Command("powershell", "-NoProfile", "-Command", psScript)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return []NetAdapter{}, nil
	}

	if len(output) == 0 {
		return []NetAdapter{}, nil
	}

	var adapters []NetAdapter
	err = json.Unmarshal(output, &adapters)
	if err != nil {
		var single NetAdapter
		if err2 := json.Unmarshal(output, &single); err2 == nil {
			return []NetAdapter{single}, nil
		}
		return []NetAdapter{}, nil
	}

	return adapters, nil
}

func (a *App) RestartAdapter(name string) error {
	psCommand := "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Restart-NetAdapter -Name '" + name + "' -Confirm:$false"
	cmd := exec.Command("powershell", "-NoProfile", "-Command", psCommand)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}

func (a *App) GetVersion() string {
	return a.version
}
