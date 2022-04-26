import type { PreloadedAccountData } from "types/SavedAccountData";
import AppOverlay from "components/AppOverlay";

function Timetable ({ account }: { account: PreloadedAccountData }) {
  return (
    <div>
      <p>Emploi du temps de {account.slug} !</p>
    </div>
  );
}

export default AppOverlay(Timetable);