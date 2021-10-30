/**
 * Fixing some typos in the schools name.
 * That's not a real feature,
 * but anyways I prefer to keep it !
 */
export default function fixSchoolName (schoolName: string): string {
  return schoolName
    .replace("LYCEE", "LYCÉE")
    .replace("COLLEGE", "COLLÈGE")
    .trim();
}