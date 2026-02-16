# Hackathon
A simple website that teaches the user about cybersecurity awareness.

## Setup Instructions

### API Keys Configuration

This project uses external APIs for URL and PDF security scanning. To use these features, you need to set up your API keys:

1. Copy the example configuration file:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your API keys:
   - **PhishArk API Key**: Get your free API key from [https://phishark.io](https://phishark.io)
   - **VirusTotal API Key**: Get your free API key from [https://www.virustotal.com/](https://www.virustotal.com/)

3. The `config.js` file is excluded from version control to protect your API keys.

### Running the Application

Simply open `index.html` in your web browser to start the application.

**Note**: The `config.js` file is gitignored for security. Never commit your actual API keys to version control.
  
