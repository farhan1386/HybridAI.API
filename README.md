# Hybrid AI Intelligence Hub ⚡

A high-performance, real-time token streaming pipeline built using a decoupled **.NET 10 Minimal API** backend and a Vite-powered **React Single Page Application (SPA)** frontend. 

This project implements a cost-efficient **Hybrid Routing Architecture** leveraging Microsoft’s unified `IChatClient` abstractions. It dynamically routes intelligence requests to a local instance of **Ollama (Llama 3.2)** for standard tasks, with the ability to scale up to **OpenAI (GPT-4o Mini)** via cloud synchronization.

---

## 🏗️ Architecture Overview

[ React Frontend ] 📲 http://localhost:61121││  (HTTP POST / Chunked Text Stream)▼[ .NET 10 Web API ] ⚙️ http://localhost:5006│├───► [ Local Inference ] 🦙 Ollama (Llama 3.2) -> http://localhost:11434│└───► [ Cloud Inference ] ☁️ OpenAI API (GPT-4o Mini)

### Key Features
*   **Agnostic AI Integration**: Implements the native `Microsoft.Extensions.AI` design ecosystem.
*   **True Token Streaming**: Bypasses traditional MVC buffering to push runtime string tokens instantly to the client interface.
*   **Dynamic Client Fallback**: Features a UI-selectable dropdown to swap foundational models mid-conversation.
*   **Robust Frontend Parsing**: Uses `react-markdown` to securely capture and render streaming text and code snippets without UI layout shifts.
*   **Isolated Code Blocks**: Custom interactive components equipped with a "Copy to Clipboard" functional interface.

---

## 🛠️ Tech Stack & Dependencies

### Backend Engine
*   **Runtime Environment**: .NET 10.0 LTS
*   **Dependencies (`HybridAI.API.csproj`)**:
    *   `Microsoft.Extensions.AI` (Unified interfaces)
    *   `Microsoft.Extensions.AI.OpenAI` (OpenAI bridge integration)
    *   `OllamaSharp` (Official native driver for local LLM instances)
    *   `Microsoft.AspNetCore.OpenApi` (Native .NET 10 OpenAPI engine specifications)

### Frontend Workspace
*   **Core UI Library**: React 18+ (Scaffolded using Vite)
*   **Dependencies**:
    *   `react-markdown` (On-the-fly markdown structural token rendering)

---

## 🚀 Getting Started

### Prerequisites
1.  Install the [.NET 10 SDK](https://microsoft.com).
2.  Install [Node.js](https://nodejs.org) (v18+ recommended).
3.  Install and run [Ollama](https://ollama.com), then download your preferred local model:
    ```bash
    ollama run llama3.2
    ```

### 1. Backend Configuration (`/Backend`)

1. Ensure your local secrets file or environment variable maps a valid OpenAI credential string:
   ```bash
   dotnet user-secrets set "OpenAI:ApiKey" "your-actual-api-key-here"
   ```
2. Restore package assemblies and execute the target runtime host:
   ```bash
   dotnet restore
   dotnet run
   ```
   *Note: Ensure the backend executes on port `5006` or adjust the frontend constant pointer variable accordingly.*

### 2. Frontend Configuration (`/Frontend`)

1. Navigate to your project folder workspace, fetch client dependencies, and initiate the Vite development server mapping the exact CORS designated layout execution port:
   ```bash
   npm install
   npm run dev -- --port 61121
   ```
2. Navigate your primary local browser to `http://localhost:61121` to access the AI control panel matrix dashboard interface.

---

## 📝 Critical Development Notes

### Cross-Origin Resource Sharing (CORS)
The .NET backend is explicitly configured to listen exclusively to incoming connection frames originating from origin host `http://localhost:61121`. If your Vite client application initializes on an alternative node path (such as `5173`), amend the allowed policies explicitly inside `Program.cs` to avoid standard security handshake blockades:

```csharp
policy.WithOrigins("http://localhost:YOUR_NEW_PORT")
```

### Buffer Flush Optimization
To secure smooth streaming, the backend utilizes `context.Response.Body.FlushAsync()` immediately after pushing single token strings into the client communication channel pipeline. This ensures text blocks are displayed in real-time on the frontend rather than waiting for long response buffers to complete.
