// Facebook SDK TypeScript definitions

interface Window {
  FB: {
    init: (params: {
      appId: string;
      cookie?: boolean;
      xfbml?: boolean;
      version: string;
    }) => void;
    
    login: (
      callback: (response: {
        authResponse?: {
          accessToken: string;
          code?: string;
          expiresIn: number;
          signedRequest: string;
          userID: string;
        };
        status: string;
      }) => void,
      options?: {
        config_id?: string;
        response_type?: string;
        override_default_response_type?: boolean;
        extras?: {
          setup?: any;
          featureType?: string;
          sessionInfoVersion?: number;
        };
        scope?: string;
        return_scopes?: boolean;
        auth_type?: string;
      }
    ) => void;
    
    logout: (callback: () => void) => void;
    
    getLoginStatus: (callback: (response: any) => void) => void;
    
    api: (path: string, params: any, callback: (response: any) => void) => void;
  };
  
  fbAsyncInit: () => void;
}
