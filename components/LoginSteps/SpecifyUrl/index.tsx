import {
  TextField
} from "@mui/material";

export function SpecifyUrl ({
  pronoteUrl,
  setPronoteUrl
}: {
  pronoteUrl: string;
  setPronoteUrl: (value: string) => void;
}) {

  return (
    <div>
      {pronoteUrl}
      <TextField
        variant="outlined"
        
        value={pronoteUrl}
        onChange={({ target }) => setPronoteUrl(target.value)}
      />
    </div>
  );
}
