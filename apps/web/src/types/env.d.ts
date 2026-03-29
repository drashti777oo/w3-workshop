declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_NFT_ADDRESS?: string;
    PRIVATE_KEY?: string;
    ERC721_DEPLOYMENT_API_URL?: string;
  }
}
