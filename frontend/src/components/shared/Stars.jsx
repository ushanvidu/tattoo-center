import Icons from './Icons';

export default function Stars({ value = 4.7, n }) {
  return (
    <span className="stars" aria-label={`${value} stars`}>
      {[0,1,2,3,4].map(i => <Icons.star key={i} filled={i < Math.round(value)} />)}
      {n != null && (
        <span style={{ marginLeft: 7, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--faint)' }}>
          {value} ({n})
        </span>
      )}
    </span>
  );
}
