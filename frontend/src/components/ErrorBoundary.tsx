import React, { Component, ErrorInfo, ReactNode } from 'react';

ps {
  children: ReactNode;
  fallback?: ReactNode
  onError?: (error: Err
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Ce> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: fae,
      error: null,
      ull,
 };
  }

  static gettate {
    return {
      hasErrrue,
      error,
      ,

  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    nfo);
    this.setState({
      error,
      errorI
    });
    
) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
ck) {
        return this.props.fallback;
      }

      return (
        <div className="m-900">
          <div className="max-w-md w-full bg-whenter">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h->
                <path strokeLine
      
/div>
            <h2 className="text-xl >
              Something went wrong
    
            <p className="text-gray-600 dark">
              We're sorry, but something unexpected happened. Please try refreshing page.
       </p>

              <button
                onC
                classNors"
              >
                Refrese
       >
    on

                className="w-fulors"
              >
    
tton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;