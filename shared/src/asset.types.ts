export interface AssetTemplateLayer {
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Text properties
  content?: string; // Supports {{merge_tags}}
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  // Image properties
  src?: string;
  // Shape properties
  shape?: 'rectangle' | 'circle';
  fill?: string;
  borderRadius?: number;
  opacity?: number;
}

export interface AssetTemplate {
  id: string;
  user_id: string;
  name: string;
  width: number;
  height: number;
  background_color: string;
  layers: AssetTemplateLayer[];
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetTemplateInput {
  name: string;
  width?: number;
  height?: number;
  background_color?: string;
  layers?: AssetTemplateLayer[];
}

export interface UpdateAssetTemplateInput extends Partial<CreateAssetTemplateInput> {}

export interface AssetRenderParams {
  [key: string]: string;
}
