export interface BlockInCatalog extends Prismeai.Block {
  slug: string;
  builtIn?: boolean;
  from?: Prismeai.LocalizedText;
  variants?: BlockInCatalog[];
  icon?: string;
}
