/**
 * API Client for making requests to the backend
 */

const API_BASE_URL = 'https://automatic-watering-system.web.id';

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  queryParams?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Creates query string from object of query parameters
 */
const createQueryString = (params: Record<string, string>): string => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Main function to make API requests
 */
export const apiRequest = async <T>({
  method,
  path,
  body,
  queryParams,
  requiresAuth = true,
}: ApiOptions): Promise<T> => {
  // Build the full URL
  let url = `${API_BASE_URL}${path}`;
  
  // Add query params if they exist
  if (queryParams) {
    const queryString = createQueryString(queryParams);
    url = `${url}?${queryString}`;
  }

  // Build request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // No need to include credentials for this API
    credentials: 'same-origin', 
  };

  // Add auth token if required
  if (requiresAuth) {
    // Check both storage locations for a token
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const token = localToken || sessionToken;
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    } else if (!path.includes('/auth/')) {
      // If there's no token and we're trying to access a protected endpoint
      console.error('No authentication token found for protected endpoint:', path);
    }
  }

  // Add request body if it exists
  if (body) {
    options.body = JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(url, options);

  // Handle authentication errors, but don't redirect if this is the login endpoint
  if (response.status === 401 && !path.includes('/auth/login')) {
    // Clear tokens from both storage locations
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to signin page (new UI)
    window.location.href = '/signin';
    throw new Error('Authentication required');
  }

  // Parse and return the response
  if (response.ok) {
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (!text || text.trim() === '') {
        // Handle completely empty responses
        if (Array.isArray(({} as T))) {
          return [] as unknown as T; // Return empty array for array types
        } else {
          return {} as T; // Return empty object for object types
        }
      }
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        // If parsing fails, return empty result based on expected type
        if (Array.isArray(({} as T))) {
          return [] as unknown as T;
        } else {
          return {} as T;
        }
      }
    }
    
    // If no content-type or not json, return empty result 
    if (Array.isArray(({} as T))) {
      return [] as unknown as T;
    }
    return {} as T;
  } else {
    // Try to get error details from the response
    let errorMessage: string;
    try {
      const errorData = await response.json();
      console.log('API error response:', JSON.stringify(errorData));
      
      // Special handling for login errors
      if (path.includes('/auth/login')) {
        if (response.status === 401) {
          errorMessage = 'Invalid username/email or password';
        } else if (response.status === 403) {
          errorMessage = 'Email not verified. Please check your email for a verification link.';
        }
      }
      
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.error_description) {
        errorMessage = errorData.error_description;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        // Handle validation errors that might be an array
        errorMessage = errorData.map(err => err.message || err.detail || JSON.stringify(err)).join(', ');
      } else if (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        // Handle FastAPI validation errors format
        errorMessage = errorData.detail.map(err => {
          if (err.msg) {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? `${field}: ` : ''}${err.msg}`;
          }
          return JSON.stringify(err);
        }).join(', ');
      } else {
        // If we can't find a specific error message property, convert the entire object to a string
        errorMessage = JSON.stringify(errorData);
      }
    } catch (e) {
      // If we can't parse the JSON, use the status code
      if (path.includes('/auth/login')) {
        if (response.status === 401) {
          errorMessage = 'Invalid username/email or password';
        } else if (response.status === 403) {
          errorMessage = 'Email not verified. Please check your email for a verification link.';
        } else {
          errorMessage = `Login failed with status ${response.status}`;
        }
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }
    }
    
    console.error(`API Error (${response.status}) for ${path}:`, errorMessage);
    throw new Error(errorMessage);
  }
};

// Convenience methods for common HTTP verbs
export const get = <T>(path: string, queryParams?: Record<string, string>, requiresAuth = true): Promise<T> => {
  return apiRequest<T>({ method: 'GET', path, queryParams, requiresAuth });
};

export const post = <T>(path: string, body?: any, queryParams?: Record<string, string>, requiresAuth = true): Promise<T> => {
  return apiRequest<T>({ method: 'POST', path, body, queryParams, requiresAuth });
};

export const put = <T>(path: string, body?: any, queryParams?: Record<string, string>, requiresAuth = true): Promise<T> => {
  return apiRequest<T>({ method: 'PUT', path, body, queryParams, requiresAuth });
};

export const del = <T>(path: string, queryParams?: Record<string, string>, requiresAuth = true): Promise<T> => {
  return apiRequest<T>({ method: 'DELETE', path, queryParams, requiresAuth });
};