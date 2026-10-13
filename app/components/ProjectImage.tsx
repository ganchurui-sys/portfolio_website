import Image, { type ImageProps } from "next/image";
import { projectImageSource } from "../project-media";

export default function ProjectImage(props: ImageProps) {
  const source = typeof props.src === "string" ? projectImageSource(props.src) : props.src;
  const prepared = typeof source === "string" && source.startsWith("/project-media-v1/");
  return <Image {...props} src={source} unoptimized={prepared || props.unoptimized} />;
}
