// Helper function to select an appropriate emoji based on tags or title
function getActivityIcon(tags, title) {
  const titleLower = title.toLowerCase();
  const tagString = tags.join(' ').toLowerCase();
  const combined = titleLower + ' ' + tagString;

  // Match activity types to appropriate emoji
  if (combined.includes('swim') || combined.includes('swimming')) {
    return '🏊‍♂️';
  } else if (combined.includes('surf') || combined.includes('surfing')) {
    return '🏄‍♂️';
  } else if (combined.includes('kayak')) {
    return '🚣‍♂️';
  } else if (combined.includes('sail') || combined.includes('sailing')) {
    return '⛵';
  } else if (combined.includes('paddle') || combined.includes('paddleboard')) {
    return '🏄‍♀️';
  } else if (combined.includes('dive') || combined.includes('diving') || combined.includes('snorkel')) {
    return '🤿';
  } else if (combined.includes('boat') || combined.includes('rowing')) {
    return '🚣‍♀️';
  } else if (combined.includes('fish') || combined.includes('fishing')) {
    return '🎣';
  } else if (combined.includes('beach')) {
    return '🏖️';
  } else if (combined.includes('rescue') || combined.includes('safety')) {
    return '🆘';
  } else if (combined.includes('children') || combined.includes('kids')) {
    return '👶';
  } else if (combined.includes('advanced') || combined.includes('expert')) {
    return '🏆';
  } else if (combined.includes('beginner') || combined.includes('intro')) {
    return '🔰';
  }

  // Default water-related emoji
  return '🌊';
}// CustomBookwhenEvents.jsx - Styled to match your water adventure theme
import { useState, useEffect } from 'react';

export default function CustomBookwhenEvents({ apiKey, limit = 6, filter = {}, className = "" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // Add pagination and includes
    params.append('page[size]', limit.toString());
    params.append('include', 'tickets,attachments,location');

    return params.toString();
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const queryParams = buildQueryParams();
        const url = `https://api.bookwhen.com/v2/events?${queryParams}`;

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
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching Bookwhen events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiKey, limit, filter]);

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="text-lg">Loading upcoming courses...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-600">
      Error loading courses: {error}. Please try again later.
    </div>
  );

  if (events.length === 0) return (
    <div className="p-4 text-center">
      No upcoming courses at the moment. Please check back soon!
    </div>
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
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

  // Get the first 100 characters of details and add ellipsis if longer
  const shortDescription = details ?
    (details.length > 100 ? details.substring(0, 100) + '...' : details)
    : '';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full group">
      {/* Event banner with decorative element instead of an image */}
      <div className="w-full h-32 bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden">
        {/* Decorative wave pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 C15,65 35,65 50,50 C65,35 85,35 100,50 L100,100 L0,100 Z" fill="white" />
          </svg>
        </div>

        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md">
          <div className="text-center">
            <span className="block text-xs font-semibold text-gray-500">{startDate.toLocaleString('default', { month: 'short' })}</span>
            <span className="block text-xl font-bold text-primary-600">{startDate.getDate()}</span>
          </div>
        </div>

        {/* Activity emoji/icon */}
        <div className="absolute bottom-4 left-4 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
          <span className="text-2xl" role="img" aria-label="Water activity">
            {getActivityIcon(tags || [], title)}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-primary-600 transition-colors duration-300">{title}</h3>

        <div className="flex items-center mb-3 text-gray-600">
          <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            {formatDate(startDate)}
            {!all_day && ` | ${formatTime(startDate)} - ${formatTime(endDate)}`}
          </span>
        </div>

        {shortDescription && (
          <p className="text-gray-600 mb-4">{shortDescription}</p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Availability information */}
        {availableSpots !== null && (
          <div className="mt-4 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isSoldOut ? 'bg-red-500' : 'bg-green-500'}`}></div>
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
          href={event.attributes.url || `https://bookwhen.com/events/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center font-semibold py-3 px-4 rounded-lg transition duration-300
            ${isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
        >
          {isSoldOut ? 'Sold Out' : 'Book Now'}
        </a>
      </div>
    </div>
  );
}
