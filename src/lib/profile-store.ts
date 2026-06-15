import { useEffect, useState } from "react";
import { persona as defaultPersona } from "./persona";

export type UserProfile = {
  name: string;
  initials: string;
  level: string;
  school: string;
  location: string;
  major: string;
  gpa: string;
  firstGen: boolean;
  pellEligible: boolean;
  identity: string[];
  careerGoal: string;
  shortBio: string;
  experiences: string; // freeform — kept simple for MVP
  awards: string; // newline-separated
};

const STORAGE_KEY = "scholar-e:profile";

export const defaultProfile: UserProfile = {
  name: defaultPersona.name,
  initials: defaultPersona.initials,
  level: defaultPersona.level,
  school: defaultPersona.school,
  location: defaultPersona.location,
  major: defaultPersona.major,
  gpa: defaultPersona.gpa,
  firstGen: defaultPersona.firstGen,
  pellEligible: defaultPersona.pellEligible,
  identity: defaultPersona.identity,
  careerGoal: defaultPersona.careerGoal,
  shortBio: defaultPersona.shortBio,
  experiences:
    "Undergraduate Researcher — Rice DataLab (Jan 2026–present)\nVP Outreach — SHPE Rice Chapter (Aug 2025–present)\nPeer Tutor — Rice OWL Center (Sep 2025–present)",
  awards: defaultPersona.experiences.awards.join("\n"),
};

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ME";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function useProfile(): {
  profile: UserProfile;
  isCustom: boolean;
  save: (p: UserProfile) => void;
  reset: () => void;
} {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        setProfile({ ...defaultProfile, ...parsed });
        setIsCustom(true);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const save = (p: UserProfile) => {
    const next = { ...p, initials: deriveInitials(p.name) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
    setIsCustom(true);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(defaultProfile);
    setIsCustom(false);
  };

  return { profile, isCustom, save, reset };
}
