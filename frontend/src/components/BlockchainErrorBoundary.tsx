import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Wallet, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'wallet' | 'network' | 'contract' | 'transaction' | 'unknown';

class BlockchainErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
    };

  static getDerivedStateFromError(error: Error): State {
    const errorType = BlockchainErrorBoundary.categorizeError(error);
    return {
      hasError: true,
      error,
      errorType,
    };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BlockchainErrorBoundary caught an error:', error, errorInfo);
    
    // Show appropriate toast notification
    this.showErrorToast(error);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);

  private static categorizeError(error: Error): 'wallet' | 'network' | 'contract' | 'transaction' | 'unknown' {
    const message = error.message.toLowerCase();
    
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'wallet';
    
    if (message.includes('network') || message.includes('connection') || message.includes('rpc')) {
      return 'network';
    
    if (message.includes('contract') || message.includes('revert') || message.includes('execution reverted')) {
      return 'contract';
    
    if (message.includes('transaction') || message.includes('gas') || message.includes('nonce')) {
      return 'transaction';
    
    return 'unknown';

  private showErrorToast = (error: Error) => {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'wallet':
        toast.error('Transaction was cancelled by user');
        break;
      case 'network':
        toast.error('Network connection error. Please check your connection and try again.');
        break;
      case 'contract':
        toast.error('Smart contract error. Please verify your inputs and try again.');
        break;
      case 'transaction':
        toast.error('Transaction failed. Please check your gas settings and try again.');
        break;
      default:
        toast.error('An unexpected blockchain error occurred');
  };

  private getErrorMessage = (): { title: string; description: string; action: string } => {
    const { errorType, error } = this.state;
    
    switch (errorType) {
      case 'wallet':
        return {
          title: 'Wallet Connection Issue',
          description: 'There was a problem with your wallet connection or you cancelled the transaction.',
          action: 'Please check your wallet and try again.',
        };
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the Polygon Mumbai network.',
          action: 'Please check your network connection and ensure you\'re connected to Polygon Mumbai.',
        };
      case 'contract':
        return {
          title: 'Smart Contract Error',
          description: 'The smart contract operation failed. This could be due to invalid data or contract restrictions.',
          action: 'Please verify your inputs and ensure you have the necessary permissions.',
        };
      case 'transaction':
        return {
          title: 'Transaction Failed',
          description: 'The blockchain transaction could not be completed.',
          action: 'Please check your gas settings and account balance, then try again.',
        };
      default:
        return {
          title: 'Blockchain Error',
          description: error?.message || 'An unexpected error occurred while interacting with the blockchain.',
          action: 'Please try again or contact support if the problem persists.',
        };
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'unknown',
    });
  };

  private handleConnectWallet = () => {
    // Trigger wallet connection
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { title, description, action } = this.getErrorMessage();
      const { errorType } = this.state;

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {errorType === 'wallet' ? (
                <Wallet className="h-6 w-6 text-red-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {title}
              </h3>
              
              <p className="text-red-700 mb-2">
                {description}
              </p>
              
              <p className="text-sm text-red-600 mb-4">
                {action}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </button>
                
                {errorType === 'wallet' && (
                  <button
                    onClick={this.handleConnectWallet}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap mt-2">{this.state.error.stack}</pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );

    return this.props.children;

export default BlockchainErrorBoundary;
}}}}}}}}}}}}}}}}