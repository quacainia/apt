export {}; // This ensures the file is treated as a module

declare global {
  interface Window {
    piwigoData?: {
      pageTitle: string;
      banner: string;
      headerMsgs: string[];
      headerNotes: string[];
      contentDescription: string;
      aptThemeStatus?: { distpath?: string; isPluginInstalled?: boolean };
      // Add any other Smarty variables you've injected here
    };
    viteDevServer: string;
  }
}
