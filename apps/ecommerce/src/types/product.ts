export interface Product {
  id: string;
  name: string;
  /** Price stored as an integer count of piastres — never a float. */
  priceInPiastres: number;
  imageSrc: string;
  category: string;
}
