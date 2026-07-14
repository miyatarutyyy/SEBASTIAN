'use client';

import { useSteward } from '@/lib/useSteward';
import SleepingScreen from '@/components/SleepingScreen';
import WakingScreen from '@/components/WakingScreen';
import AwakeScreen from '@/components/AwakeScreen';
import styles from './page.module.css';

export default function Page() {
  const steward = useSteward();
  return (
    <main
      className={styles.app}
      data-state={steward.lifeState}
    >
      {steward.lifeState === 'sleeping' && <SleepingScreen steward={steward} />}
      {steward.lifeState === 'waking' && <WakingScreen steward={steward} />}
      {steward.lifeState === 'awake' && <AwakeScreen steward={steward} />}
    </main>
  );
}