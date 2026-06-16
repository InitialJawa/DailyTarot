export interface TarotCard {
  id: string;
  name: string;
  number: number;
  image: string;
  arcana: "Major" | "Minor";
}

export const majorArcana: TarotCard[] = [
  { id: "0", name: "The Fool", number: 0, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_00_Fool.jpg" },
  { id: "1", name: "The Magician", number: 1, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_01_Magician.jpg" },
  { id: "2", name: "The High Priestess", number: 2, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_02_High_Priestess.jpg" },
  { id: "3", name: "The Empress", number: 3, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_03_Empress.jpg" },
  { id: "4", name: "The Emperor", number: 4, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_04_Emperor.jpg" },
  { id: "5", name: "The Hierophant", number: 5, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_05_Hierophant.jpg" },
  { id: "6", name: "The Lovers", number: 6, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_06_Lovers.jpg" },
  { id: "7", name: "The Chariot", number: 7, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_07_Chariot.jpg" },
  { id: "8", name: "Strength", number: 8, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_08_Strength.jpg" },
  { id: "9", name: "The Hermit", number: 9, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_09_Hermit.jpg" },
  { id: "10", name: "Wheel of Fortune", number: 10, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_10_Wheel_of_Fortune.jpg" },
  { id: "11", name: "Justice", number: 11, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_11_Justice.jpg" },
  { id: "12", name: "The Hanged Man", number: 12, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_12_Hanged_Man.jpg" },
  { id: "13", name: "Death", number: 13, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_13_Death.jpg" },
  { id: "14", name: "Temperance", number: 14, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_14_Temperance.jpg" },
  { id: "15", name: "The Devil", number: 15, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_15_Devil.jpg" },
  { id: "16", name: "The Tower", number: 16, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_16_Tower.jpg" },
  { id: "17", name: "The Star", number: 17, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_17_Star.jpg" },
  { id: "18", name: "The Moon", number: 18, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_18_Moon.jpg" },
  { id: "19", name: "The Sun", number: 19, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_19_Sun.jpg" },
  { id: "20", name: "Judgement", number: 20, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_20_Judgement.jpg" },
  { id: "21", name: "The World", number: 21, arcana: "Major", image: "https://raw.githubusercontent.com/lalesleon13-hash/Tarot/main/RWS_Tarot_21_World.jpg" },
];
