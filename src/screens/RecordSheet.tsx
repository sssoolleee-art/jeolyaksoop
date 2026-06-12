import { CSSProperties, useState } from 'react';
import { CATEGORIES } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';
import { CategoryId } from '../types';
import { C, Sheet, useBackEvent } from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: (water: number, completed: boolean) => void;
}

export default function RecordSheet({ visible, onClose, onSaved }: Props) {
  const addRecord = useAppStore(s => s.addRecord);
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [custom, setCustom] = useState('');
  const [memo, setMemo] = useState('');

  const close = () => { setCat(null); setCustom(''); setMemo(''); onClose(); };
  // 카테고리 선택 단계에서 뒤로가기 → 시트 닫기 대신 단계 복귀
  useBackEvent(visible && cat !== null, () => setCat(null));

  const save = (amount: number) => {
    if (!cat || !Number.isFinite(amount) || amount <= 0) return;
    const { water, completed } = addRecord(cat, amount, memo.trim() || undefined);
    close();
    onSaved(water, completed);
  };
  const selected = CATEGORIES.find(c => c.id === cat);

  return (
    <Sheet visible={visible} onClose={close}>
      {!selected ? (
        <>
          <p style={title}>뭘 참았어요?</p>
          <div style={grid}>
            {CATEGORIES.map(c => (
              <button key={c.id} style={cell} onClick={() => setCat(c.id)}>
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ fontSize: 12, color: '#333D4B', marginTop: 4 }}>{c.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p style={title}>{selected.emoji} {selected.label}, 얼마짜리였어요?</p>
          <input
            style={{ ...input, marginBottom: 12, width: '100%', boxSizing: 'border-box' }}
            placeholder="어떤 유혹이었나요? (선택 — 리포트에 남아요)" maxLength={40}
            value={memo} onChange={e => setMemo(e.target.value)}
          />
          <div style={presets}>
            {selected.presets.map(p => (
              <button key={p} style={preset} onClick={() => save(p)}>
                {p.toLocaleString()}원
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={input} inputMode="numeric" placeholder="직접 입력 (원)"
              value={custom} onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <button style={saveBtn} onClick={() => save(parseInt(custom, 10) || 0)}>저장</button>
          </div>
          <button style={back} onClick={() => setCat(null)}>카테고리 다시 선택</button>
        </>
      )}
    </Sheet>
  );
}

const title: CSSProperties = { fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 16px' };
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 };
const cell: CSSProperties = {
  aspectRatio: '1', background: C.bg, borderRadius: 16, border: 'none',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontFamily: 'inherit',
};
const presets: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 };
const preset: CSSProperties = {
  background: C.greenSoft, color: C.green, fontWeight: 600, border: 'none',
  borderRadius: 12, padding: '10px 14px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
};
const input: CSSProperties = {
  flex: 1, background: C.bg, border: 'none', borderRadius: 12, padding: '12px 14px',
  fontSize: 16, fontFamily: 'inherit', outline: 'none', minWidth: 0,
};
const saveBtn: CSSProperties = {
  background: C.green, color: '#FFF', fontWeight: 700, border: 'none',
  borderRadius: 12, padding: '0 18px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
};
const back: CSSProperties = {
  background: 'none', border: 'none', color: C.sub, fontSize: 14, marginTop: 14,
  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
};
