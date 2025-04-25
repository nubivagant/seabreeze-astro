// BookwhenEvents.jsx - Fixed with correct Basic Authentication
import { useState, useEffect } from 'react';

export default function BookwhenEvents({ apiKey, limit = 10, filter = {}, className = "" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Construct query parameters for filtering
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // Add filters with proper format conversion
    if (filter.from) {
      // Convert ISO date format (YYYY-MM-DD) to Bookwhen format (YYYYMMDD)
      const fromDate = filter.from.includes('-')
        ? filter.from.replace(/-/g, '')
        : filter.from;
      params.append('filter[from]', fromDate);
    }

    if (filter.to) {
      const toDate = filter.to.includes('-')
        ? filter.to.replace(/-/g, '')
        : filter.to;
      params.append('filter[to]', toDate);
    }

    // Handle array parameters correctly
    if (filter.title && Array.isArray(filter.title)) {
      params.append('filter[title]', filter.title.join(','));
    } else if (filter.title) {
      params.append('filter[title]', filter.title);
    }

    if (filter.location && Array.isArray(filter.location)) {
      params.append('filter[location]', filter.location.join(','));
    } else if (filter.location) {
      params.append('filter[location]', filter.location);
    }

    if (filter.tag && Array.isArray(filter.tag)) {
      params.append('filter[tag]', filter.tag.join(','));
    } else if (filter.tag) {
      params.append('filter[tag]', filter.tag);
    }

    // Add pagination
    params.append('page[size]', limit.toString());
    params.append('page[number]', page.toString());

    // Include ticket information and details
    params.append('include', 'tickets,attachments,location');

    return params.toString();
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const queryParams = buildQueryParams();
        const url = `https://api.bookwhen.com/v2/events?${queryParams}`;

        console.log("Fetching from URL:", url);
        console.log("Using API key (first 4 chars only):", apiKey ? apiKey.substring(0, 4) + "..." : "undefined");

        // Basic authentication requires encoding "apiKey:" in base64
        // Note the colon at the end (empty password)
        const authString = btoa(`${apiKey}:`);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`API error: ${response.status}. Details: ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        console.log("API response:", data);
        setEvents(prevEvents => (page > 1 ? [...prevEvents, ...data.data] : data.data) || []);

        // Check if there's a next page link in the response
        setHasMore(data.links && data.links.next ? true : false);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching Bookwhen events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiKey, limit, page, filter]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) return <div className="flex justify-center p-8"><div className="text-lg">Loading events...</div></div>;
  if (error) return <div className="p-4 text-red-600">Error loading events: {error}</div>;
  if (events.length === 0) return <div className="p-4">No events found</div>;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors duration-300 disabled:bg-blue-400"
          >
            {loading ? 'Loading...' : 'Load More Events'}
          </button>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }) {
  // Extract information from the API response
  const {
    title,
    start_at,
    end_at,
    details,
    all_day,
    tags,
    attendee_count,
    attendee_limit
  } = event.attributes;

  // Format dates in British English style
  const startDate = new Date(start_at);
  const endDate = new Date(end_at);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  // Calculate availability
  const isSoldOut = attendee_limit && attendee_count >= attendee_limit;
  const availableSpots = attendee_limit ? attendee_limit - (attendee_count || 0) : null;

  // Access location if available
  const location = event.relationships?.location?.data;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Event image - if available in the relationships */}
      {event.attributes.event_image && (
        <div className="w-full h-48 bg-gray-200">
          <img
            src={event.attributes.event_image.image_url || '/api/placeholder/400/320'}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>

        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-gray-600">
            {formatDate(startDate)}
            {!all_day && ` | ${formatTime(startDate)} - ${formatTime(endDate)}`}
          </span>
        </div>

        {location && (
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="text-gray-600">{location.id}</span>
          </div>
        )}

        {details && (
          <div className="mb-4">
            <p className="text-gray-600 line-clamp-3">{details}</p>
          </div>
        )}

        {/* Tags display */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Availability information */}
        {availableSpots !== null && (
          <div className="mt-2 mb-4">
            <span className={`text-sm font-medium ${isSoldOut ? 'text-red-600' : 'text-green-600'}`}>
              {isSoldOut
                ? 'Sold Out'
                : `${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} available`}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <a
          href={`https://bookwhen.com/seabreeze/e/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center font-medium py-2 px-4 rounded transition-colors duration-300
            ${isSoldOut
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isSoldOut ? 'Sold Out' : 'Book Now'}
        </a>
      </div>
    </div>
  );
}
