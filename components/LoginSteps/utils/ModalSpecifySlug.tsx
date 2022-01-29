import type {
  SavedAccountData
} from "types/SavedAccountData";

type ModalSpecifySlugProps = {
  authData: SavedAccountData;
};

import React, { useState } from "react";
import { useRouter } from "next/router";

import InputText from "components/InputText";
import Button from "components/Button";

import { setAccountData } from "@/webUtils/accountsStore";

export default function ModalSpecifySlug ({ authData }: ModalSpecifySlugProps) {
  const [slug, setSlug] = useState("");
  const router = useRouter();

  const handleSlugInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    const checkedValue = value.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

    setSlug(checkedValue);
  };

  const handleSlugSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    await setAccountData(slug, authData);
    router.push("/");
  };

  return (
    <div
      className="
        absolute top-0 left-0 h-screen w-screen bg-brand-dark bg-opacity-40
        flex flex-col justify-center items-center gap-8
      "
    >
      <form
        onSubmit={handleSlugSubmit}
        className="flex flex-col justify-center items-center gap-4"
      >
        <InputText
          id="modalSpecifySlug-slugInput"
          placeholder="Slug, nom du compte qui sera sauvegardé locallement."
          value={slug}
          onChange={handleSlugInput}
        />
        <Button
          buttonType="submit"
        >
          Sauvegarder le compte
        </Button>
      </form>
    </div>
  );
}