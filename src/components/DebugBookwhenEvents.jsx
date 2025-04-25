// DebugBookwhenEvents.jsx - A debugging component with proper Basic Authentication
import { useState, useEffect } from 'react';

export default function DebugBookwhenEvents({ apiKey }) {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Log API key info for debugging (never log the full key)
        console.log("API Key present:", !!apiKey);
        console.log("API Key first 4 chars:", apiKey ? apiKey.substring(0, 4) + "..." : "undefined");

        // Basic request with minimal parameters
        const today = new Date();
        const formattedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const url = `https://api.bookwhen.com/v2/events?filter[from]=${formattedDate}&include=tickets,location`;
        console.log("Fetching from:", url);

        // Basic Authentication - encode "apiKey:" (note the colon for blank password)
        const authString = btoa(`${apiKey}:`);
        console.log("Using Basic Authentication");

        const response = await fetch(url, {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json'
          }
        });

        // Get response as text first for debugging
        const responseText = await response.text();
        console.log("Response status:", response.status);
        console.log("Response headers:", JSON.stringify([...response.headers.entries()]));

        // Try to parse as JSON if possible
        try {
          const data = JSON.parse(responseText);
          setApiResponse(data);
        } catch (e) {
          console.log("Response is not valid JSON:", responseText.substring(0, 500));
          setApiResponse(responseText);
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}. Response: ${responseText.substring(0, 300)}`);
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiKey]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Bookwhen API Debug Information</h2>

      {loading && <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">Loading...</div>}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap mt-2">{error}</pre>
        </div>
      )}

      {apiResponse && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">API Response:</h3>
          <div className="bg-white p-4 rounded border overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">
              {typeof apiResponse === 'string'
                ? apiResponse
                : JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">Debugging Checklist:</h3>
        <ul className="list-disc pl-6">
          <li>Verify your API key is correct and has proper permissions</li>
          <li>Check that your .env file is named correctly (.env not env.txt)</li>
          <li>Verify you're using the correct variable name: PUBLIC_BOOKWHEN_KEY</li>
          <li>Make sure you've restarted your dev server after adding the .env file</li>
          <li>The API uses <strong>Basic Authentication</strong> with the API key as username and blank password</li>
          <li>The request URL should be in the format: https://api.bookwhen.com/v2/events</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-green-100 rounded">
        <h3 className="font-bold mb-2">Testing Basic Authentication:</h3>
        <p className="mb-2">You can test your API key with this command:</p>
        <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
          curl "https://api.bookwhen.com/v2/events" -u 'YOUR_API_KEY:'
        </pre>
        <p className="mt-2 text-sm">Note the colon after the API key (representing an empty password)</p>
      </div>
    </div>
  );
}
