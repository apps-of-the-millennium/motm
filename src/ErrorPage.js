import React from 'react';
import './ErrorPage.css';

const ErrorPage = () => {
  return (
    <div className="errorPage">
        <h2>404</h2>
        <h1>Page Not Found</h1>
        <p>The specified file was not found on this website. Please check the URL for mistakes and try again.</p>
    </div>
  );
}

export default ErrorPage;

