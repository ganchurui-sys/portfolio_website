import CharacterStudyGallery from "./CharacterStudyGallery";

const looks = [
  { title: "RACING JACKET", description: "金发、眼镜与紫色赛车夹克" },
  { title: "FOREST HOODIE", description: "黑发、深绿色卫衣与牛仔短裤" },
  { title: "LAYERED STREETWEAR", description: "黑发、眼镜、黑色外套与格纹衬衫" },
  { title: "CAP & HEADPHONES", description: "棕色棒球帽、银色耳机与黑白拼色夹克" },
  { title: "BROWN JACKET", description: "金发、眼镜与棕色夹克" },
  { title: "DENIM & TIE", description: "黑框眼镜、浅蓝牛仔夹克与条纹领带" },
  { title: "CHECKED SHIRT", description: "黑发与蓝色格纹衬衫" },
].map((look, index) => ({
  ...look,
  src: `/aigc/project-01/turnarounds-white-v1/turnaround-${String(index + 1).padStart(2, "0")}.webp`,
  alt: `${look.description}：人物展示及正面、侧面、背面三视图`,
  thumbnail: `/aigc/project-01/turnarounds-white-v1/turnaround-${String(index + 1).padStart(2, "0")}-thumb.webp`,
  width: 3840,
  height: 2160,
}));

export default function CharacterTurnarounds() {
  return (
    <CharacterStudyGallery
      id="character-turnarounds"
      title="CHARACTER TURNAROUNDS"
      translation="角色转变"
      descriptionEn="Each character is generated across multiple viewpoints to test visual consistency. Facial structure, hairstyle, proportions and styling are maintained from front to side and back."
      descriptionZh="通过生成每个角色的多个视角，检验其视觉一致性。从正面到侧面及背面，始终保持面部结构、发型、身体比例与整体造型的一致。"
      detailLabel="三视图"
      looks={looks}
    />
  );
}
