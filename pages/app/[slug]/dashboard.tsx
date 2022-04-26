import type { PreloadedAccountData } from "types/SavedAccountData";
import AppOverlay from "components/AppOverlay";

import Link from "next/link";

function Dashboard ({ account }: { account: PreloadedAccountData }) {
  return (
    <div>
      <p>Bienvenue, slug {account.slug} !</p>
      <Link href={`/app/${account.slug}/timetable`}>
        <a>Timetable</a>
      </Link>

    </div>
  );
}

export default AppOverlay(Dashboard);