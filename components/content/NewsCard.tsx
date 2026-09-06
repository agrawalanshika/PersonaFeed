import ContentCard from "@/components/content/ContentCard";
import type { ContentItem } from "@/types/content";

type NewsCardProps = {
  item: ContentItem & { type: "news" };
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export default function NewsCard(props: NewsCardProps) {
  return <ContentCard {...props} />;
}
