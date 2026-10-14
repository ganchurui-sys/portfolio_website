import CharacterStudyGallery, { type StudyLook } from "./CharacterStudyGallery";

const media = "/project-media-v1/aigc/project-01/outfits-v2";

const looks: StudyLook[] = [
  {
    title: "CHECKED SHIRT",
    description: "蓝色格纹衬衫、深色牛仔裤与黑色皮鞋",
    referenceWidth: 245,
    referenceHeight: 360,
  },
  {
    title: "CAP & HEADPHONES",
    description: "棕色棒球帽、银色耳机与黑白拼色夹克",
    referenceWidth: 610,
    referenceHeight: 899,
  },
  {
    title: "DENIM & TIE",
    description: "浅蓝牛仔夹克、条纹领带与头戴式耳机",
    referenceWidth: 660,
    referenceHeight: 973,
  },
  {
    title: "STYLE COLLECTION",
    description: "多套角色造型与服装配饰合集",
  },
].map((look, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    title: look.title,
    description: look.description,
    src: `${media}/look-${number}.webp`,
    thumbnail: `${media}/look-${number}-thumb.webp`,
    alt: `${look.description}：AI 角色造型与服装、配饰拆解拼贴`,
    width: 1672,
    height: index === 3 ? 940 : 941,
    reference: look.referenceWidth && look.referenceHeight ? {
      src: `${media}/reference-${number}.webp`,
      alt: `日常穿搭参考照片：${look.description}`,
      width: look.referenceWidth,
      height: look.referenceHeight,
    } : undefined,
  };
});

export default function OutfitStudies() {
  return (
    <CharacterStudyGallery
      id="outfit-studies"
      title="FROM OUTFIT TO CHARACTER"
      translation="从日常穿搭，到角色造型"
      descriptionEn="Everyday outfits become references for character styling. Clothing, colors and accessories are translated into digital looks while retaining the character’s identity."
      descriptionZh="以日常穿搭为参考，将服装、配色与配饰转化为角色造型，在不同风格中保留角色的辨识度。"
      detailLabel="穿搭对照"
      looks={looks}
    />
  );
}
