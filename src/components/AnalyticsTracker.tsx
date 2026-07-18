import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Initialize GA4 with your Measurement ID
const TRACKING_ID = "G-77XJ9S1564"; 
ReactGA.initialize(TRACKING_ID);

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Send a pageview whenever the URL changes
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

export default AnalyticsTracker;
