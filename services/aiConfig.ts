import { SpeechRecognitionConfig } from "./speechRecognitionService";

/**
 * Configuration for local AI transcription using Gemma 3n
 *
 * To use your local Gemma 3n model:
 * 1. Make sure your Gemma 3n model is running locally
 * 2. Update the endpoint URL to match your setup
 * 3. Adjust the model name if different
 * 4. Set enabled to true to use AI transcription
 */
export const gemma3nConfig: SpeechRecognitionConfig = {
  language: "en-US",
  continuous: false,
  interim: false,
  maxAlternatives: 1,
  localAI: {
    enabled: true, // Set to false to use fallback transcription
    endpoint: "http://localhost:11434/api/generate", // Ollama default endpoint
    model: "gemma2:2b", // Your Gemma 3n model name
    timeout: 30000, // 30 seconds
    // apiKey: 'your-api-key-here', // Uncomment if your setup requires authentication
  },
};

/**
 * Alternative configurations for different setups
 */
export const aiConfigs = {
  // Standard Ollama setup
  ollama: {
    ...gemma3nConfig,
    localAI: {
      ...gemma3nConfig.localAI,
      endpoint: "http://localhost:11434/api/generate",
      model: "gemma2:2b",
    },
  },

  // Custom port setup
  customPort: {
    ...gemma3nConfig,
    localAI: {
      ...gemma3nConfig.localAI,
      endpoint: "http://localhost:8080/api/v1/generate", // Adjust port as needed
      model: "gemma:3b-instruct-q4_0", // Different model variant
    },
  },

  // Remote AI server setup
  remote: {
    ...gemma3nConfig,
    localAI: {
      ...gemma3nConfig.localAI,
      endpoint: "http://your-ai-server.local:11434/api/generate",
      model: "gemma2:2b",
      apiKey: "your-remote-api-key",
    },
  },

  // Disabled AI (fallback to mock transcription)
  disabled: {
    ...gemma3nConfig,
    localAI: {
      ...gemma3nConfig.localAI,
      enabled: false,
    },
  },
};

/**
 * Helper function to test if your AI endpoint is accessible
 */
export async function testAIConnection(
  config: SpeechRecognitionConfig
): Promise<boolean> {
  if (!config.localAI?.enabled || !config.localAI?.endpoint) {
    return false;
  }

  try {
    const response = await fetch(
      config.localAI.endpoint.replace("/api/generate", "/api/tags"),
      {
        method: "GET",
        headers: config.localAI.apiKey
          ? {
              Authorization: `Bearer ${config.localAI.apiKey}`,
            }
          : {},
      }
    );

    return response.ok;
  } catch (error) {
    console.warn("AI connection test failed:", error);
    return false;
  }
}

/**
 * Helper function to validate that your model is available
 */
export async function validateModel(
  config: SpeechRecognitionConfig
): Promise<boolean> {
  if (
    !config.localAI?.enabled ||
    !config.localAI?.endpoint ||
    !config.localAI?.model
  ) {
    return false;
  }

  try {
    const response = await fetch(
      config.localAI.endpoint.replace("/api/generate", "/api/tags"),
      {
        method: "GET",
        headers: config.localAI.apiKey
          ? {
              Authorization: `Bearer ${config.localAI.apiKey}`,
            }
          : {},
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    const models = data.models || [];

    return models.some(
      (model: any) =>
        model.name === config.localAI!.model ||
        model.model === config.localAI!.model
    );
  } catch (error) {
    console.warn("Model validation failed:", error);
    return false;
  }
}
