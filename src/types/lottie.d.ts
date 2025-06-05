declare module "*.json" {
  const value: any;
  export default value;
}

// Lottie animation data type
export interface LottieAnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: any[];
  layers: any[];
  markers?: any[];
}