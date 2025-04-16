import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

import type { DBUser, DBArt, DBVArt } from "@/shared/types/mock-db";

// Helper to get a random element from an array
const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateFakeData = () => {
  const users: DBUser[] = [];
  const artworks: DBArt[] = [];
  const virtualArtworks: DBVArt[] = [];

  // Step 1: Generate 10 users
  for (let i = 0; i < 10; i++) {
    const id = uuidv4();
    users.push({
      PK: `USER#${id}`,
      SK: `USER`,
      f_name: faker.person.firstName(),
      l_name: faker.person.lastName(),
      birthdate: faker.date
        .birthdate({ min: 1995, max: 2012, mode: "year" })
        .toISOString()
        .split("T")[0],
      can_submit_art: faker.datatype.boolean(),
      created_at: faker.date.past().toISOString(),
      has_active_submission: faker.datatype.boolean(),
      has_paid: faker.datatype.boolean(),
      pi_id: `pi_${faker.string.alphanumeric(6)}`,
      active_vote_id: faker.datatype.boolean() ? uuidv4() : null,
      guardian: faker.datatype.boolean(),
    });
  }

  const userPKs = users.map((u) => u.PK);

  // Step 2: Generate 8 artworks linked to 8 distinct users
  const availableUserPKs = [...userPKs]; // shallow copy

  for (let i = 0; i < 8 && availableUserPKs.length > 0; i++) {
    const index = Math.floor(Math.random() * availableUserPKs.length);
    const userPK = availableUserPKs.splice(index, 1)[0]; // remove after picking

    artworks.push({
      PK: `ART#${userPK}`,
      SK: "SEASON#FIFA_2025",
      age_of_artist: faker.number.int({ min: 10, max: 17 }),
      title: faker.word.words(2),
      f_name: faker.person.firstName(),
      file_type: faker.helpers.arrayElement(["png", "jpg", "jpeg"]),
      is_ai_gen: faker.datatype.boolean(),
      is_approved: faker.datatype.boolean(),
      location: faker.location.state({ abbreviated: true }),
      model: faker.helpers.arrayElement([
        "",
        "Midjourney",
        "DALL·E 3",
        "StableDiffusionXL",
      ]),
      prompt: faker.lorem.sentence(),
      category: faker.helpers.arrayElement([
        "Sports",
        "Nature",
        "Dreamscape",
        "Drama",
      ]),
      votes: faker.number.int({ min: 0, max: 50 }),
      submitted_at: faker.date.recent().toISOString(),
    });
  }

  // Step 3: Generate 10 VArt entries for one user
  const sharedUser = sample(users);
  for (let i = 0; i < 10; i++) {
    const id = uuidv4();
    virtualArtworks.push({
      PK: `VART#${id}`,
      SK: "SEASON#FIFA_2025",
      user_id: sharedUser.PK.replace("USER#", ""), // strip USER# prefix
      age_of_artist: faker.number.int({ min: 10, max: 17 }),
      title: faker.word.words(2),
      f_name: faker.person.firstName(),
      file_type: faker.helpers.arrayElement(["png", "jpg"]),
      is_ai_gen: faker.datatype.boolean(),
      is_approved: faker.datatype.boolean(),
      location: faker.location.state({ abbreviated: true }),
      model: faker.helpers.arrayElement(["", "DALL·E 2", "SDXL", "MJv5"]),
      prompt: faker.lorem.sentence(),
      category: faker.helpers.arrayElement(["Action", "Sci-fi", "Fantasy"]),
      votes: faker.number.int({ min: 0, max: 100 }),
      submitted_at: faker.date.recent().toISOString(),
    });
  }

  return {
    users,
    artworks,
    virtualArtworks,
  };
};
