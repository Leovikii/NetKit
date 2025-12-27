# NetKit

A lightweight and beautiful Network Interface Manager for Windows, built with **Go**, **Wails**, **React**, and **TailwindCSS v4**.

## Features

- ⚡ **Zero-delay Startup**: Immediate skeletal loading screen.
- 🎨 **Modern UI**: Vertical layout, frameless window, and glassmorphism effects.
- 🔍 **Detailed Insights**: View IPv4/IPv6, Gateway, DNS, MAC address, and Link Speed.
- 🛡️ **Admin Control**: Restart network adapters directly from the UI.
- 🚀 **High Performance**: Optimized PowerShell queries for instant data retrieval.

## Tech Stack

- **Backend**: Go (Wails framework)
- **Frontend**: React + TypeScript
- **Styling**: TailwindCSS v4
- **Platform**: Windows (amd64)

## Development

```bash
# Install dependencies
cd frontend
npm install

# Run in dev mode
wails dev