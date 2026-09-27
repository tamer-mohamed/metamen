export interface Product {
  id: string;
  name: string;
  /** Price stored as an integer count of piastres — never a float. */
  priceInPiastres: number;
  imageSrc: string;
  category: string;
  /** Optional — not every product has detail copy yet. */
  description?: string;
  /** Optional — only shown on the detail page when present. */
  sizes?: string[];
}
