import { useStore } from '../../context/StoreContext';
import Icons from '../shared/Icons';

export default function Toasts() {
  const s = useStore();
  return (
    <div className="toast-wrap">
      {s.toasts.map(t => (
        <div className="toast" key={t.id}>
          <span className="ic"><Icons.check /></span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
