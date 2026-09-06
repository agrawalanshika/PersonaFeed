import ContentCard from "@/components/content/ContentCard";
import type { ContentItem } from "@/types/content";

type MovieCardProps = {
  item: ContentItem & { type: "movie" };
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export default function MovieCard(props: MovieCardProps) {
  return <ContentCard {...props} />;
}
