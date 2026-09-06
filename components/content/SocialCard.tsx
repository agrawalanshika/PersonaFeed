import ContentCard from "@/components/content/ContentCard";
import type { ContentItem } from "@/types/content";

type SocialCardProps = {
  item: ContentItem & { type: "social" };
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export default function SocialCard(props: SocialCardProps) {
  return <ContentCard {...props} />;
}
