import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-xl font-black uppercase tracking-widest mb-2 text-gray-900">System Error</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Something went wrong while rendering this view.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
                            <code className="text-[10px] text-red-600 font-mono break-all">
                                {this.state.error?.message || 'Unknown error'}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold tracking-wide active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
