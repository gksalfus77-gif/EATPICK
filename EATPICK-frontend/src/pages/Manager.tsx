import React, { useState, useRef, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant, CategoryType } from '../types/restaurant';
import { memberService } from '../services/memberService';
import { trafficStatsService } from '../services/trafficStatsService';

// ============================================================================
// ─── 1. 외부 모듈 및 타입 정의 ──────────────────────────────────────────────
// ============================================================================
type PageId =
  | 'dashboard'
  | 'stats'
  | 'restaurants'
  | 'categories'
  | 'members';

interface NavItemProps {
  id: PageId;
  activePage: PageId;
  onClick: (id: PageId) => void;
  icon: React.ReactNode;
  badge?: number;
  children: React.ReactNode;
}

// ============================================================================
// ─── 2. 사이드바 네비게이션 및 아이콘 컴포넌트 ──────────────────────────────
// ============================================================================
const NavItem: React.FC<NavItemProps> = ({ id, activePage, onClick, icon, badge, children }) => {
  const isActive = activePage === id;
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '8px 9px', borderRadius: '6px', cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
        fontSize: '13px', marginBottom: '1px', border: 'none',
        background: isActive ? '#db0000' : 'none', width: '100%', textAlign: 'left',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'none';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
        }
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.85)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 500 }}>
          {badge}
        </span>
      )}
    </button>
  );
};

const Icons: Record<string, React.ReactNode> = {
  dashboard:  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  stats:      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  restaurant: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  category:   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  member:     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tool:       <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};


// ============================================================================
// ─── 3. 공통 UI 요소 컴포넌트 ───────────────────────────────────────────────
// ============================================================================
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue';
const Badge: React.FC<{ variant: BadgeVariant; children: React.ReactNode }> = ({ variant, children }) => {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    green: { background: '#d1fae5', color: '#065f46' },
    amber: { background: '#fef3c7', color: '#92400e' },
    red:   { background: '#fee2e2', color: '#991b1b' },
    blue:  { background: '#dbeafe', color: '#1e40af' },
  };
  return (
    <span style={{ display: 'inline-block', fontSize: '10.5px', padding: '2px 7px', borderRadius: '20px', fontWeight: 500, ...styles[variant] }}>
      {children}
    </span>
  );
};

const TableCard: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
    <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #e5e7eb', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{title}</span>
      {action}
    </div>
    <div style={{ overflowX: 'auto' }}>{children}</div>
  </div>
);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{ padding: '7px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb', fontSize: '12px', whiteSpace: 'nowrap' }}>{children}</th>
);
const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td style={{ padding: '8px 16px', color: '#111827', borderBottom: '0.5px solid #e5e7eb', fontSize: '12px', whiteSpace: 'nowrap' }}>{children}</td>
);

const StatCard: React.FC<{ label: string; value: string; change: string; changeColor?: string }> = ({ label, value, change, changeColor = '#059669' }) => (
  <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px' }}>
    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px' }}>{label}</div>
    <div style={{ fontSize: '22px', fontWeight: 500, color: '#111827' }}>{value}</div>
    <div style={{ fontSize: '11px', marginTop: '3px', color: changeColor }}>{change}</div>
  </div>
);

const BarRow: React.FC<{ label: string; pct: number; value: string; color?: string }> = ({ label, pct, value, color = '#ff4c4c' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
    <span style={{ fontSize: '11px', color: '#6b7280', width: '52px', flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '8px', borderRadius: '3px', background: color }} />
    </div>
    <span style={{ fontSize: '11px', color: '#6b7280', width: '30px', textAlign: 'right', flexShrink: 0 }}>{value}</span>
  </div>
);


// ============================================================================
// ─── 4. 팝업 모달 창 컴포넌트 ───────────────────────────────────────────────
// ============================================================================

const AddRestaurantModal: React.FC<{ 
  onClose: () => void; 
  onSave: (data: RestaurantFormData & { restId?: number }) => void;
  initialData?: any; 
}> = ({ onClose, onSave, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [tagId, setTagId] = useState<number | ''>(
    initialData ? CATEGORIES.find(c => c.value === initialData.category)?.id || '' : ''
  ); 
  const [rating] = useState(initialData?.rating ? String(initialData.rating) : '');
  const [district] = useState('');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [breakTime] = useState('');
  const [holiday, setHoliday] = useState(initialData?.closedDays || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'운영중' | '준비중'>(
    initialData?.status === 'ACTIVE' ? '운영중' : (initialData?.status === 'PENDING' ? '준비중' : '운영중')
  );

  const [existingPhotos, setExistingPhotos] = useState<{ id: number; url: string }[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((img: any, idx: number) => ({
        id: idx + 1,
        url: img.imgUrl || img 
      }));
    }
    return [];
  });
  
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [nextPhotoId, setNextPhotoId] = useState(1);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (initialData?.menus && initialData.menus.length > 0) {
      return initialData.menus.map((m: any, idx: number) => ({
        id: idx + 1,
        name: m.pName || m.pname || m.name || '',
        price: m.price ? String(m.price) : ''
      }));
    }
    return [{ id: 1, name: '', price: '' }];
  });
  const [nextMenuId, setNextMenuId] = useState(initialData?.menus ? initialData.menus.length + 1 : 2);

  const [hours, setHours] = useState({
    weekdayOpen: '11:00', weekdayClose: '22:00',
    satOpen: '11:00', satClose: '22:00',
    sunOpen: '11:00', sunClose: '21:00',
  });
  
  useEffect(() => {
    if (initialData?.businessHours) {
      const times = initialData.businessHours.split(' ~ ');
      if (times.length === 2) {
        setHours(prev => ({ ...prev, weekdayOpen: times[0], weekdayClose: times[1] }));
      }
    }
  }, [initialData]);

  const [minPrice, setMinPrice] = useState(initialData?.minPrice ? String(initialData.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(initialData?.maxPrice ? String(initialData.maxPrice) : '');
  const [avgPrice, setAvgPrice] = useState(initialData?.avgPrice ? String(initialData.avgPrice) : '');
  const [snsUrl, setSnsUrl] = useState(initialData?.snsUrl || '');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { id: nextPhotoId, url, file }]);
      setNextPhotoId(n => n + 1);
    });
  };

  const removeNewPhoto = (id: number) => setPhotos(prev => prev.filter(p => p.id !== id));
  const removeExistingPhoto = (id: number) => setExistingPhotos(prev => prev.filter(p => p.id !== id));

  const addMenu = () => {
    setMenuItems(prev => [...prev, { id: nextMenuId, name: '', price: '' }]);
   setNextMenuId((n: number) => n + 1);
  };
  const removeMenu = (id: number) => setMenuItems(prev => prev.filter(m => m.id !== id));
  const updateMenu = (id: number, field: 'name' | 'price', val: string) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const handleSave = () => {
    if (!name.trim()) { alert('가게 이름을 입력해주세요.'); return; }
    if (tagId === '') { alert('카테고리를 선택해주세요.'); return; }
    
    onSave({ 
      name, tagId: tagId as number, rating, district, address, phone, hours, 
      breakTime, holiday, minPrice, maxPrice, avgPrice, snsUrl, description, 
      status, menuItems, photos, existingPhotos, restId: initialData?.restId
    });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    fontSize: '13px', padding: '8px 10px', borderRadius: '6px',
    border: '1px solid #e5e7eb', background: '#fff', color: '#111827',
    width: '100%', outline: 'none', fontFamily: 'sans-serif', transition: 'border-color 0.15s',
  };
  const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#6b7280', marginBottom: '5px', display: 'block' };
  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' };
  const sectionLabelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' };
  const dividerStyle: React.CSSProperties = { height: '1px', background: '#f3f4f6', margin: '4px 0' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '24px 16px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid #e5e7eb', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'slideUp 0.2s ease' }}>
        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .modal-input:focus { border-color: #3b82f6 !important; }
          .photo-zone:hover { background: #f0f6ff !important; border-color: #93c5fd !important; }
          .del-icon-btn:hover { background: #fee2e2 !important; color: #991b1b !important; }
          .add-row-btn:hover { background: #f0f9ff !important; }
          .pill-btn { transition: all 0.12s; }
        `}</style>
        
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{initialData ? '맛집 정보 수정' : '새 맛집 추가'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
          
          <div>
            <p style={sectionLabelStyle}>가게 사진</p>
            <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} className="photo-zone" style={{ border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'all 0.15s' }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 3px' }}>클릭 또는 드래그로 새 사진 업로드</p>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>JPG, PNG, WEBP · 여러 장 선택 가능</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
            
            {/* 기존 사진 & 새 사진 렌더링 */}
            {(existingPhotos.length > 0 || photos.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {existingPhotos.map(p => (
                  <div key={`exist-${p.id}`} style={{ position: 'relative' }}>
                    <img src={p.url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '7px', border: '2px solid #3b82f6' }} title="기존 업로드된 사진" />
                    <button onClick={() => removeExistingPhoto(p.id)} className="del-icon-btn" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
                {photos.map(p => (
                  <div key={`new-${p.id}`} style={{ position: 'relative' }}>
                    <img src={p.url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '7px', border: '0.5px solid #e5e7eb' }} />
                    <button onClick={() => removeNewPhoto(p.id)} className="del-icon-btn" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={dividerStyle} />
          
          <div>
            <p style={sectionLabelStyle}>기본 정보</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>가게 이름 *</label>
                <input className="modal-input" style={inputStyle} type="text" placeholder="예: 진미반점" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>카테고리 *</label>
                  <select className="modal-input" style={inputStyle} value={tagId} onChange={e => setTagId(e.target.value === '' ? '' : Number(e.target.value))}>
                    <option value="">카테고리 선택</option>
                    <option value="1">채식</option>
                    <option value="2">주류</option>
                    <option value="3">이국요리</option>
                    <option value="4">괴식요리</option>
                    <option value="5">유명셰프</option>
                    <option value="6">미슐랭</option>
                    <option value="7">키즈존</option>
                    <option value="8">동물출입</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div style={dividerStyle} />
          
          <div>
            <p style={sectionLabelStyle}>위치 & 연락처</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>상세 주소</label>
                <input className="modal-input" style={inputStyle} type="text" placeholder="예: 서울특별시 강남구 테헤란로 123 1층" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>전화번호</label>
                <input className="modal-input" style={inputStyle} type="tel" placeholder="예: 02-1234-5678" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div style={dividerStyle} />
          
          <div>
            <p style={sectionLabelStyle}>세부 정보</p>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 12px 1fr', alignItems: 'center', gap: '6px', rowGap: '8px' }}>
              <span /><span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>오픈</span><span /><span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>마감</span>
              {[ { label: '영업시간', open: 'weekdayOpen', close: 'weekdayClose' } ].map(row => (
                <React.Fragment key={row.label}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{row.label}</span>
                  <input className="modal-input" type="time" style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }} value={hours[row.open as keyof typeof hours]} onChange={e => setHours(prev => ({ ...prev, [row.open]: e.target.value }))} />
                  <span style={{ textAlign: 'center', color: '#d1d5db', fontSize: '12px' }}>~</span>
                  <input className="modal-input" type="time" style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }} value={hours[row.close as keyof typeof hours]} onChange={e => setHours(prev => ({ ...prev, [row.close]: e.target.value }))} />
                </React.Fragment>
              ))}
            </div>
            
            <div style={{ marginTop: '10px', ...fieldStyle }}>
              <label style={labelStyle}>가게 설명</label>
              <textarea className="modal-input" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div style={fieldStyle}><label style={labelStyle}>휴무일</label><input className="modal-input" style={inputStyle} type="text" placeholder="예: 매주 화요일" value={holiday} onChange={e => setHoliday(e.target.value)} /></div>
              <div style={fieldStyle}><label style={labelStyle}>SNS 주소</label><input className="modal-input" style={inputStyle} type="url" placeholder="예: https://instagram.com/..." value={snsUrl} onChange={e => setSnsUrl(e.target.value)} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>최소 금액 (원)</label>
                <input className="modal-input" style={inputStyle} type="number" placeholder="8000" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>최대 금액 (원)</label>
                <input className="modal-input" style={inputStyle} type="number" placeholder="45000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
            
            <div style={{ marginTop: '10px', ...fieldStyle }}>
                <label style={labelStyle}>평균 금액 (원)</label>
                <input className="modal-input" style={inputStyle} type="number" placeholder="예: 18000" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} />
            </div>
          </div>

          <div style={dividerStyle} />
          
          <div>
            <p style={sectionLabelStyle}>메뉴 목록</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', paddingLeft: '2px' }}>메뉴 이름</span><span style={{ fontSize: '11px', color: '#9ca3af' }}>가격 (원)</span><span />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', gap: '6px', alignItems: 'center' }}>
                  <input className="modal-input" style={inputStyle} type="text" placeholder="예: 짜장면" value={item.name} onChange={e => updateMenu(item.id, 'name', e.target.value)} />
                  <input className="modal-input" style={inputStyle} type="number" placeholder="8000" value={item.price} onChange={e => updateMenu(item.id, 'price', e.target.value)} />
                  <button className="del-icon-btn" onClick={() => removeMenu(item.id)} style={{ width: '32px', height: '36px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', transition: 'all 0.12s', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button className="add-row-btn" onClick={addMenu} style={{ marginTop: '8px', width: '100%', border: '1px dashed #d1d5db', borderRadius: '6px', padding: '8px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.12s', fontFamily: 'sans-serif' }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              메뉴 추가
            </button>
          </div>

          <div style={dividerStyle} />
          
          <div>
            <p style={sectionLabelStyle}>등록 상태</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['운영중', '준비중'] as const).map(s => (
                <button key={s} className="pill-btn" onClick={() => setStatus(s)} style={{ padding: '7px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'sans-serif', border: status === s ? (s === '운영중' ? '1.5px solid #3b82f6' : '1.5px solid #d97706') : '1px solid #e5e7eb', background: status === s ? (s === '운영중' ? '#eff6ff' : '#fffbeb') : '#fff', color: status === s ? (s === '운영중' ? '#1d4ed8' : '#92400e') : '#6b7280', fontWeight: status === s ? 500 : 400 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '8px', background: '#fafafa' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontFamily: 'sans-serif' }}>취소</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'sans-serif' }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// ─── 5. 데이터 인터페이스 및 상수 정의 ──────────────────────────────────────
// ============================================================================

interface MenuItem { id: number; name: string; price: string; }
interface PhotoPreview { id: number; url: string; file: File; }

interface RestaurantFormData {
  name: string; 
  tagId: number; 
  rating: string; 
  district: string; 
  address: string; 
  phone: string;
  hours: { weekdayOpen: string; weekdayClose: string; satOpen: string; satClose: string; sunOpen: string; sunClose: string; };
  breakTime: string; 
  holiday: string; 
  minPrice: string;
  maxPrice: string;
  avgPrice: string;
  snsUrl: string;
  description: string; 
  status: '운영중' | '준비중'; 
  menuItems: MenuItem[]; 
  photos: PhotoPreview[];
  existingPhotos?: { id: number; url: string }[]; 
}

type MemberStatus = '정상' | '주의' | '정지됨';
interface MemberRow {
  id: string; // email(PK)
  nickname: string; 
  email: string; 
  joinDate: string; 
  reviewCount: number; 
  status: MemberStatus; 
  warnings: number;
}

type RestaurantData = Restaurant & { status?: string; rating?: number | string };

const CATEGORIES = [
  { id: 1, name: '채식 (VEGETARIAN)', value: 'VEGETARIAN' },
  { id: 2, name: '주류 (MAINSTREAM)', value: 'MAINSTREAM' },
  { id: 3, name: '이국요리 (EXOTIC)', value: 'EXOTIC' },
  { id: 4, name: '괴식요리 (ECCENTRIC)', value: 'ECCENTRIC' },
  { id: 5, name: '유명셰프 (FAMOUSCHEF)', value: 'FAMOUSCHEF' },
  { id: 6, name: '미슐랭 (MICHELIN)', value: 'MICHELIN' },
  { id: 7, name: '키즈존 (KIDSZONE)', value: 'KIDSZONE' },
  { id: 8, name: '동물출입 (PETACCESS)', value: 'PETACCESS' },
];


// ============================================================================
// ─── 6. 메인 콘텐츠 영역 및 전역 상태 관리 (PageContent) ────────────────────
// ============================================================================

const PageContent: React.FC<{ page: PageId }> = ({ page }) => {
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantData | null>(null); 
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1); 
  const [totalMembers, setTotalMembers] = useState(0); 

  // 🌟 [수정됨] 키워드 통계용 상태 변수들 (AddRestaurantModal에서 이쪽으로 올바르게 이동)
  const [todayKeywords, setTodayKeywords] = useState<{keyword: string, count: number}[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [statsPage, setStatsPage] = useState(0);
  const [statsTotalPages, setStatsTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([
    { id: 1, name: '채식', value: 'VEGETARIAN', count: 0 },
    { id: 2, name: '주류', value: 'MAINSTREAM', count: 0 },
    { id: 3, name: '이국요리', value: 'EXOTIC', count: 0 },
    { id: 4, name: '괴식요리', value: 'ECCENTRIC', count: 0 },
    { id: 5, name: '유명셰프', value: 'FAMOUSCHEF', count: 0 },
    { id: 6, name: '미슐랭', value: 'MICHELIN', count: 0 },
    { id: 7, name: '키즈존', value: 'KIDSZONE', count: 0 },
    { id: 8, name: '동물출입', value: 'PETACCESS', count: 0 }
  ]);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [totalRestaurantsCount, setTotalRestaurantsCount] = useState(0);

  // ─── Effect Hooks ────────────────────────────────────────────────────────
  
  useEffect(() => {
    const getInitialStats = async () => {
      try {
        const data = await memberService.getMemberList(0, 10);
        setTotalMembers(data.totalElements);
      } catch (e) { console.error(e); }
    };
    getInitialStats();
  }, []);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const updatedList = await Promise.all(
        categoryList.map(async (cat) => {
          try {
            const result = await restaurantService.getRestaurantListByCategory(cat.value, 0, 100);
            return { ...cat, count: result.length };
          } catch (e) {
            return { ...cat, count: 0 };
          }
        })
      );
      setCategoryList(updatedList);
    };
    
    fetchCategoryCounts();
    fetchRestaurantsList(0); // 최초 1회 전체/혹은 페이징 리스트 가져오기
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRestaurantsList = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      // 이제 result는 { content: [], totalPages: 4, ... } 형태의 객체입니다.
      const result = await restaurantService.getRestaurantList('', pageNumber, 5); 
      
      // 💡 content와 totalPages를 각각 나누어 저장!
      setRestaurants(result.content); 
      setTotalPages(result.totalPages); 
      setTotalRestaurantsCount(result.totalElements);
      setCurrentPage(result.number); // 백엔드에서 받은 현재 페이지 번호로 동기화
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (page === 'restaurants') {
      fetchRestaurantsList(currentPage);
    }
  }, [currentPage, page]);

  useEffect(() => {
    const fetchMembersList = async (pageNumber = 0) => {
      try {
        const data = await memberService.getMemberList(pageNumber, 10);

        setTotalMembers(data.totalElements);
        setTotalPages(data.totalPages || 1); 
        
        const formatted = data.content.map((m: any) => {
          const savedWarning = localStorage.getItem(`warnings_${m.email}`);
          const isManuallyBanned = localStorage.getItem(`banned_${m.email}`) === 'true';
          const warningCount = savedWarning ? parseInt(savedWarning, 10) : (m.warnings || 0);
          const isBanned = m.isBanned || warningCount >= 3 || isManuallyBanned;

          return {
            id: m.email, 
            nickname: m.nickname || '알수없음',
            email: m.email,
            joinDate: m.createdAt || '', 
            reviewCount: m.reviewCount || 0,
            status: isBanned ? '정지됨' : (warningCount >= 1 ? '주의' : '정상'),
            warnings: warningCount
          };
        });
        setMembers(formatted);
      } catch (err) {
        console.error("회원 목록 로드 실패", err);
      }
    };

    if (page === 'members') {
      fetchMembersList(currentPage);
    }
  }, [page, currentPage]);

  useEffect(() => {
    const fetchKeywordStats = async () => {
      try {
        // 백엔드의 페이징 구조 적용 (statsPage 연동, 기본 5개 노출)
        const resPage = await trafficStatsService.getAllStatsByDate(startDate, statsPage, 5);
        const rawData = resPage.content || [];
        
        setStatsTotalPages(resPage.totalPages || 1);

        const map: Record<string, number> = {};
        rawData.forEach((item: any) => {
          // 특정 키워드(예: 떡볶이) 묶음 처리
          const keyword = item.keyword.includes('떡볶이') ? '떡볶이' : item.keyword;
          map[keyword] = (map[keyword] || 0) + Number(item.mentionCount);
        });
        
        const topKeywords = Object.entries(map)
          .map(([keyword, count]) => ({ keyword, count }))
          .sort((a, b) => b.count - a.count);
          
        setTodayKeywords(topKeywords);
      } catch (e) {
        console.error("인기 키워드 로드 실패:", e);
        setTodayKeywords([]);
      }
    };
    
    fetchKeywordStats();
  }, [startDate, statsPage]);


  // ─── Handler Functions ───────────────────────────────────────────────────

  // 3. 수동 집계 핸들러
  const handleRunBatch = async () => {
    if (!window.confirm("오늘 날짜의 게시판 키워드 통계를 지금 즉시 집계하시겠습니까?")) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await trafficStatsService.runManualBatch(today);
      alert("집계가 완료되었습니다.");
    } catch (e) {
      console.error("수동 집계 실패:", e);
      alert("집계 중 오류가 발생했습니다.");
    }
  };

  // 🌟 [추가됨] 통계 전용 페이징 핸들러 함수
  const handlePrevStatsPage = () => {
    if (statsPage > 0) {
      setStatsPage(prev => prev - 1);
    }
  };

  const handleNextStatsPage = () => {
    if (statsPage < statsTotalPages - 1) {
      setStatsPage(prev => prev + 1);
    }
  };

  const handleCategorySave = async (tagId: number) => {
    if (!editCatName.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    const isSuccess = await restaurantService.updateCategoryInfo(tagId, editCatName);
    if (isSuccess) {
      setCategoryList(prev => prev.map(c => c.id === tagId ? { ...c, name: editCatName } : c));
      setEditingCatId(null);
      alert('카테고리가 성공적으로 수정되었습니다.');
    } else {
      alert('카테고리 수정 중 오류가 발생했습니다.');
    }
  };

  const handleRestaurantSave = async (data: RestaurantFormData & { restId?: number }) => {
    try {
      const imageFormData = new FormData();
      data.photos.forEach((photo) => { imageFormData.append('files', photo.file); });
      let uploadedUrls: string[] = [];
      if (data.photos.length > 0) {
          uploadedUrls = await restaurantService.uploadImages(imageFormData);
      }

      const formattedBusinessHours = data.hours.weekdayOpen && data.hours.weekdayClose 
        ? `${data.hours.weekdayOpen} ~ ${data.hours.weekdayClose}` : '';

      const createDto = {
        name: data.name, tagId: Number(data.tagId), address: data.address,
        description: data.description, phone: data.phone,
        businessHours: formattedBusinessHours, closedDays: data.holiday || '없음',
        minPrice: data.minPrice ? Number(data.minPrice) : null,
        maxPrice: data.maxPrice ? Number(data.maxPrice) : null,
        avgPrice: data.avgPrice ? Number(data.avgPrice) : null,
        snsUrl: data.snsUrl,
        menus: data.menuItems
       .filter(item => item.name && item.name.trim() !== '') // 1. 빈 칸 확실히 제거!
       .map(item => ({ 
      pName: item.name,  // 2. 대문자 N
      pname: item.name,  // 3. 소문자 n (Spring Boot 인식 에러 방지용)
      name: item.name,   // 4. 혹시 모를 기본 name
      price: Number(item.price) || 0, 
      isRepresentative: true 
       })),
        images: uploadedUrls.map((url, index) => ({ imgUrl: url, thumbUrl: url, category: "GENERAL", isMain: index === 0, displayOrder: index }))
      };

      const restId = await restaurantService.createRestaurant(createDto);

      if (restId !== null) {
        const newRest: RestaurantData = {
          restId: restId, 
          name: data.name,
          category: CATEGORIES.find(c => c.id === data.tagId)?.value as CategoryType,
          address: data.address,
          lat: 0, lng: 0, geohash: '', 
          avgPrice: Number(data.avgPrice) || 0,
          description: data.description,
          phone: data.phone,
          businessHours: formattedBusinessHours,
          closedDays: data.holiday || '없음',
          snsUrl: data.snsUrl,
          status: data.status === '운영중' ? 'ACTIVE' : 'PENDING',
        };
        setRestaurants(prev => [ newRest, ...prev ]);
        alert('식당이 성공적으로 등록되었습니다!'); 
        setShowRestaurantModal(false); 
      }
    } catch (error) {
      console.error("저장 실패", error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleRestaurantUpdate = async (data: RestaurantFormData & { restId?: number }) => {
    if (!data.restId) return;
    try {
      let newUploadedUrls: string[] = [];
      if (data.photos.length > 0) {
        const imageFormData = new FormData();
        data.photos.forEach((photo) => { imageFormData.append('files', photo.file); });
        newUploadedUrls = await restaurantService.uploadImages(imageFormData);
      }

      const preservedUrls = data.existingPhotos?.map(p => p.url) || [];
      const finalImageUrls = [...preservedUrls, ...newUploadedUrls];

      const formattedBusinessHours = data.hours.weekdayOpen && data.hours.weekdayClose 
        ? `${data.hours.weekdayOpen} ~ ${data.hours.weekdayClose}` : '';
        
      const updatedRest = {
        name: data.name,
        tagId: data.tagId,
        address: data.address,
        minPrice: data.minPrice ? Number(data.minPrice) : null,
        maxPrice: data.maxPrice ? Number(data.maxPrice) : null,
        avgPrice: data.avgPrice ? Number(data.avgPrice) : null,
        description: data.description,
        phone: data.phone,
        businessHours: formattedBusinessHours,
        closedDays: data.holiday || '없음',
        snsUrl: data.snsUrl,
        status: data.status === '운영중' ? 'ACTIVE' : 'PENDING',
       menus: data.menuItems
       .filter(item => item.name && item.name.trim() !== '') // 1. 빈 칸 확실히 제거!
       .map(item => ({ 
       pName: item.name, 
       pname: item.name, // Spring Boot 인식 에러 방지용
       name: item.name,
       price: Number(item.price) || 0, 
      isRepresentative: true 
       })),
        images: finalImageUrls.map((url, index) => ({ 
          imgUrl: url, thumbUrl: url, category: "GENERAL", isMain: index === 0, displayOrder: index 
        }))
      };

      const isSuccess = await restaurantService.updateRestaurant(data.restId, updatedRest);
      
      if (isSuccess) {
       setRestaurants(prev => prev.map(r => 
  r.restId === data.restId 
    ? { ...r, ...updatedRest, category: CATEGORIES.find(c => c.id === data.tagId)?.value as CategoryType } as unknown as RestaurantData 
    : r
));
        alert('맛집 정보가 성공적으로 수정되었습니다!');
        setEditingRestaurant(null);
      } else {
        alert('수정에 실패했습니다. 입력값을 확인해주세요.');
      }
    } catch (e) {
      console.error("수정 실패", e);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const toggleStatus = async (id: number) => {
    const current = restaurants.find(r => r.restId === id);
    if (!current) return;
    const newStatus = current.status === 'ACTIVE' ? 'PENDING' : 'ACTIVE';
    setRestaurants(prev => prev.map(r => r.restId === id ? { ...r, status: newStatus } : r));
    await restaurantService.updateRestaurant(id, { ...current, status: newStatus });
  };

  const deleteRestaurant = async (id: number) => {
    if (window.confirm('정말 이 식당 정보를 삭제하시겠습니까?')) {
      const isSuccess = await restaurantService.deleteRestaurant(id);
      if (isSuccess) {
        setRestaurants(prev => prev.filter(r => r.restId !== id));
        alert('식당이 성공적으로 삭제되었습니다.');
      } else {
        alert('식당 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };
  // 💡 수정 버튼 클릭 시 상세 정보를 불러와서 모달에 넘겨주는 함수
  const handleEditClick = async (rest: RestaurantData) => {
    if (!rest.restId) return;
    try {
      // 1. 상세 조회 API 호출 (메뉴, 사진 등 전체 데이터 가져오기)
      const detail = await restaurantService.getRestaurantDetail(rest.restId);
      
      if (detail) {
        // 2. 리스트 정보 + 방금 불러온 상세 정보를 합쳐서 모달에 전달
        setEditingRestaurant({ ...rest, ...detail } as RestaurantData);
      } else {
        setEditingRestaurant(rest);
      }
    } catch (error) {
      console.error("상세 정보 불러오기 실패:", error);
      setEditingRestaurant(rest); // 실패 시 일단 리스트 정보라도 띄움
    }
  };

  const addWarning = async (email: string) => {
    const member = members.find(m => m.email === email);
    if (!member) return;
    const newWarnings = member.warnings + 1;
    localStorage.setItem(`warnings_${email}`, newWarnings.toString());

    if (newWarnings < 3) {
      setMembers(prev => prev.map(m => 
        m.email === email ? { ...m, warnings: newWarnings, status: '주의' as MemberStatus } : m
      ));
    } else {
      try {
        await memberService.updateMemberStatus(email, true);
        setMembers(prev => prev.map(m => 
          m.email === email ? { ...m, warnings: newWarnings, status: '정지됨' as MemberStatus } : m
        ));
        alert('경고가 3회 누적되어 해당 계정이 자동으로 정지되었습니다.');
      } catch (error) {
        alert('자동 정지 처리 중 오류가 발생했습니다.');
      }
    }
  };
  
  const toggleSuspend = async (email: string) => {
    const member = members.find(m => m.email === email);
    if (!member) return;
    const isSuspend = member.status !== '정지됨'; 

    try {
      await memberService.updateStatus(email, isSuspend);
      setMembers(prev => prev.map(m => { 
        if (m.email !== email) return m; 
        
        if (!isSuspend) {
          localStorage.removeItem(`warnings_${email}`);
          localStorage.removeItem(`banned_${email}`);
          return { ...m, status: '정상' as MemberStatus, warnings: 0 }; 
        } else {
          localStorage.setItem(`banned_${email}`, 'true');
          return { ...m, status: '정지됨' as MemberStatus }; 
        }
      }));
      alert(`회원이 성공적으로 ${isSuspend ? '정지' : '복구'}되었습니다.`);
    } catch (error) {
      alert('회원 상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  const resetWarnings = (email: string) => {
    localStorage.removeItem(`warnings_${email}`);
    setMembers(prev => prev.map(m => m.email === email ? { ...m, warnings: 0, status: '정상' as MemberStatus } : m));
  };


  // ─── Utility & Render Functions ──────────────────────────────────────────

  const getCategoryName = (categoryValue: string) => {
    const categoryMap: Record<string, string> = {
      'VEGETARIAN': '채식', 'MAINSTREAM': '주류', 'EXOTIC': '이국요리',
      'ECCENTRIC': '괴식요리', 'FAMOUSCHEF': '유명셰프', 'MICHELIN': '미슐랭',
      'KIDSZONE': '키즈존', 'PETACCESS': '동물출입',
    };
    return categoryMap[categoryValue] || '기타';
  };

  const actionBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '5px',
    border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer',
    fontSize: '11px', fontFamily: 'sans-serif', transition: 'all 0.12s', whiteSpace: 'nowrap' as const,
  };
  
  const addBtn = (label: string, onClick?: () => void) => (
    <button onClick={onClick} style={{ fontSize: '11px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: 'none', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer' }}>
      {label}
    </button>
  );

  
  // ─── 렌더링 영역 (Switch) ────────────────────────────────────────────────
  switch (page) {
    case 'dashboard':
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
         <StatCard label="등록 맛집" value={totalRestaurantsCount.toLocaleString()} change="" />
          <StatCard label="전체 회원" value={totalMembers.toLocaleString()} change="" />
          <StatCard label="처리 대기" value="10" change="신고 5 · 문의 2 · 리뷰 3" changeColor="#d97706" />
        </div>
        
        <TableCard title="최근 등록 맛집" action={<span style={{ fontSize: '11px', color: '#6b7280' }}>최근 5건</span>}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>이름</Th>
                <Th>카테고리</Th>
                <Th>주소</Th> 
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody>
  {isLoading ? (
    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '15px', fontSize: '12px', color: '#6b7280' }}>데이터를 불러오는 중입니다...</td></tr>
  ) : restaurants.length === 0 ? (
    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '15px', fontSize: '12px', color: '#6b7280' }}>등록된 맛집이 없습니다.</td></tr>
  ) : (
    [...restaurants]
      .sort((a, b) => (b.restId || 0) - (a.restId || 0))
      .slice(0, 5)
      .map((r) => {
        const isActive = r.status !== 'PENDING';
        return (
          <tr key={r.restId}>
            <Td>{r.name}</Td>
            <Td>{getCategoryName(r.category)}</Td>
            <Td>{r.address || '—'}</Td> 
            <Td>
              <Badge variant={isActive ? 'green' : 'amber'}>{isActive ? '운영중' : '준비중'}</Badge>
            </Td>
          </tr>
        )
      })
  )}
</tbody>
          </table>
        </TableCard>
      </>
    );    

   case 'stats': {
      const sortedCategories = [...categoryList]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      const totalRestaurants = categoryList.reduce((acc, cur) => acc + cur.count, 0);
      
      const monthlyGrowth = [
        { month: '1월', val: Math.floor(totalMembers * 0.15) },
        { month: '2월', val: Math.floor(totalMembers * 0.2) },
        { month: '3월', val: Math.floor(totalMembers * 0.18) },
        { month: '4월', val: Math.floor(totalMembers * 0.25) },
        { month: '5월', val: Math.floor(totalMembers * 0.22) },
      ];

      return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 500, marginBottom: '12px', color: '#111827' }}>카테고리별 맛집 수</div>
              
              {sortedCategories.map(cat => (
                <BarRow 
                  key={cat.id} 
                  label={cat.name} 
                  pct={totalRestaurants > 0 ? (cat.count / totalRestaurants) * 100 : 0} 
                  value={cat.count.toString()} 
                />
              ))}
              
              <BarRow 
                label="기타" 
                pct={totalRestaurants > 0 ? ((totalRestaurants - sortedCategories.reduce((a, b) => a + b.count, 0)) / totalRestaurants) * 100 : 0} 
                value={(totalRestaurants - sortedCategories.reduce((a, b) => a + b.count, 0)).toString()} 
              />
            </div>

            <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 500, marginBottom: '12px', color: '#111827' }}>월별 회원 증가 추세</div>
              {monthlyGrowth.map((item, idx) => (
                <BarRow 
                  key={idx} 
                  label={item.month} 
                  pct={(item.val / totalMembers) * 100 * 5} 
                  value={item.val.toString()} 
                  color="#6366f1" 
                />
              ))}
            </div>
          </div>

        <div style={{ marginBottom: '12px' }}>
         <TableCard 
      title="인기 키워드 순위" 
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleRunBatch} 
            style={{ 
              fontSize: '10px', padding: '4px 9px', borderRadius: '4px', 
              background: '#db0000', color: '#fff', border: 'none', 
              cursor: 'pointer', fontWeight: 500 
            }}
          >
            수동 집계 실행
          </button>
          
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { 
              setStartDate(e.target.value); 
              setStatsPage(0); // 날짜 변경 시 페이지 리셋
            }} 
            style={{ 
              fontSize: '11px', padding: '2px 6px', border: '1px solid #d1d5db', 
              borderRadius: '4px', outline: 'none' 
            }}
          />
        </div>
      }
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Th>순위</Th>
            <Th>키워드 (KEYWORD)</Th>
            <Th>언급 횟수 (MENTION_COUNT)</Th>
          </tr>
        </thead>
        <tbody>
          {todayKeywords.length > 0 ? (
            todayKeywords.map((item, index) => (
              <tr 
                key={index} 
                style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <Td>
                  <span style={{ fontWeight: 700, color: '#db0000' }}>
                    #{statsPage * 5 + index + 1}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontWeight: 500, color: '#111827' }}>
                    {item.keyword}
                  </span>
                </Td>
                <Td>
                  <span style={{ color: '#4b5563', fontWeight: 500 }}>
                    {item.count}회
                  </span>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: '#9ca3af' }}>
                선택하신 날짜에 수집된 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🌟 페이징 네비게이션 (핸들러 함수 적용) */}
      <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', borderTop: '0.5px solid #e5e7eb', background: '#fafafa' }}>
        <button 
          disabled={statsPage <= 0} 
          onClick={handlePrevStatsPage} 
          style={{ cursor: statsPage <= 0 ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: statsPage <= 0 ? '#d1d5db' : '#374151' }}
        >
          이전
        </button>
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
          {statsPage + 1} / {statsTotalPages}
        </span>
        <button 
          disabled={statsPage >= statsTotalPages - 1} 
          onClick={handleNextStatsPage} 
          style={{ cursor: statsPage >= statsTotalPages - 1 ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: statsPage >= statsTotalPages - 1 ? '#d1d5db' : '#374151' }}
        >
          다음
        </button>
      </div>
    </TableCard>
          </div>
        </>
      );
    }

 case 'restaurants': {
     return (
       <>
         {showRestaurantModal && <AddRestaurantModal onClose={() => setShowRestaurantModal(false)} onSave={handleRestaurantSave} />}
         {editingRestaurant && (
           <AddRestaurantModal 
             initialData={editingRestaurant} 
             onClose={() => setEditingRestaurant(null)} 
             onSave={handleRestaurantUpdate} 
           />
         )}

         <style>{`
           .row-del-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
           .row-del-btn:hover svg { stroke: #991b1b; }
           .row-edit-btn:hover { background: #dbeafe !important; border-color: #bfdbfe !important; color: #1e3a8a !important; }
           tr:hover .row-actions { opacity: 1 !important; }
         `}</style>
         
         <TableCard title={`맛집 목록 (${totalRestaurantsCount})`} action={addBtn('+ 새 맛집 추가', () => setShowRestaurantModal(true))}>
           {isLoading ? (
             <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px' }}>불러오는 중...</div>
           ) : (
             <>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead><tr><Th>이름</Th><Th>카테고리</Th><Th>주소</Th><Th>상태</Th><Th>관리</Th></tr></thead>
                 <tbody>
                   {/* 💡 백엔드가 5개만 줬으므로 그대로 맵핑 */}
                   {restaurants.map(r => {
                     const isActive = r.status === 'ACTIVE';
                     return (
                       <tr key={r.restId} style={{ transition: 'background 0.1s' }}
                         onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                         onMouseLeave={e => (e.currentTarget.style.background = '')}
                       >
                         <Td>{r.name}</Td>
                         <Td>{getCategoryName(r.category)}</Td>
                         <Td>{r.address || '—'}</Td>
                         <Td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <button onClick={() => toggleStatus(r.restId as number)} style={{ width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: isActive ? '#22c55e' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background 0.2s', padding: 0 }}>
                               <span style={{ position: 'absolute', top: '3px', left: isActive ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
                             </button>
                             <span style={{ fontSize: '11px', fontWeight: 500, color: isActive ? '#15803d' : '#92400e' }}>
                               {isActive ? '운영중' : '준비중'}
                             </span>
                           </div>
                         </Td>
                         <Td>
                           <div className="row-actions" style={{ opacity: 0, transition: 'opacity 0.15s', display: 'flex', gap: '4px' }}>
                             <button className="row-edit-btn" onClick={() => handleEditClick(r)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '5px', border: '1px solid #e5e7eb', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontSize: '11px', fontFamily: 'sans-serif', transition: 'all 0.12s' }}>
                             <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>수정
                              </button>
                             <button className="row-del-btn" onClick={() => deleteRestaurant(r.restId as number)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '5px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '11px', fontFamily: 'sans-serif', transition: 'all 0.12s' }}>
                               <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>삭제
                             </button>
                           </div>
                         </Td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
               
               {/* 💡 백엔드 페이징 버튼 */}
               <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', borderTop: '0.5px solid #e5e7eb' }}>
                 <button 
                   disabled={currentPage === 0} 
                   onClick={() => fetchRestaurantsList(currentPage - 1)} 
                   style={{ padding: '4px 10px', fontSize: '12px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                 >이전</button>
                 <span style={{ fontSize: '12px' }}>{currentPage + 1} / {totalPages}</span>
                 <button 
                   disabled={currentPage >= totalPages - 1} 
                   onClick={() => fetchRestaurantsList(currentPage + 1)}
                   style={{ padding: '4px 10px', fontSize: '12px', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                 >다음</button>
               </div>
             </>
           )}
         </TableCard>
       </>
     );
   }

    case 'categories':
      return (
        <TableCard title="카테고리 목록" action={addBtn('+ 카테고리 추가')}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>카테고리명</Th>
                <Th>등록 맛집 수</Th>
                <Th>수정</Th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map(cat => (
                <tr key={cat.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <Td>
                    {editingCatId === cat.id ? (
                      <input 
                        value={editCatName} 
                        onChange={e => setEditCatName(e.target.value)}
                        style={{ fontSize: '12px', padding: '5px 8px', border: '1.5px solid #3b82f6', borderRadius: '4px', outline: 'none', width: '150px' }}
                        autoFocus
                      />
                    ) : (
                      cat.name
                    )}
                  </Td>
                  <Td>{cat.count}</Td>
                  <td style={{ padding: '8px 16px', borderBottom: '0.5px solid #e5e7eb' }}>
                    {editingCatId === cat.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleCategorySave(cat.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                          저장
                        </button>
                        <button onClick={() => setEditingCatId(null)} style={{ padding: '4px 10px', fontSize: '11px', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); }} 
                        style={actionBtnStyle}
                      >
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      );

  
    

    case 'members': {
      const safeCurrentPage = Number(currentPage) || 0;
      const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
      const isPrevDisabled = safeCurrentPage <= 0;
      const isNextDisabled = safeCurrentPage >= safeTotalPages - 1;

      return (
        <>
          <style>{`
            .member-row:hover .member-actions { opacity: 1 !important; }
            .member-row:hover { background: #f9fafb; }
            .warn-btn:hover { background: #fff7ed !important; border-color: #fb923c !important; color: #c2410c !important; }
            .warn-btn:hover svg { stroke: #c2410c; }
            .suspend-btn-on:hover  { background: #f0fdf4 !important; border-color: #4ade80 !important; color: #15803d !important; }
            .suspend-btn-off:hover { background: #fef2f2 !important; border-color: #f87171 !important; color: #991b1b !important; }
            .reset-btn:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1d4ed8 !important; }
          `}</style>
        <TableCard 
          title={`회원 목록 (${members.length}명)`} 
          action={members.filter(m => m.status === '정지됨').length > 0 ? 
            <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>
              정지 {members.filter(m => m.status === '정지됨').length}명
            </span> : undefined
          }
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>닉네임</Th><Th>이메일</Th><Th>가입일</Th><Th>리뷰 수</Th><Th>경고</Th><Th>상태</Th><Th>관리</Th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.email} className="member-row" style={{ transition: 'background 0.1s' }}>
                  <Td>{m.nickname}</Td>
                  <Td>{m.email}</Td>
                  <Td>{m.joinDate}</Td>
                  <Td>{m.reviewCount}</Td>
                  <td style={{ padding: '8px 16px', borderBottom: '0.5px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <svg key={i} viewBox="0 0 24 24" width="13" height="13" fill={i < m.warnings ? '#ef4444' : '#e5e7eb'}>
                          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                        </svg>
                      ))}
                    </div>
                  </td>
                  <Td><Badge variant={m.status === '정지됨' ? 'red' : 'green'}>{m.status}</Badge></Td>
                  <td style={{ padding: '8px 16px', borderBottom: '0.5px solid #e5e7eb' }}>
                    <div className="member-actions" style={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.15s' }}>
                      {m.status !== '정지됨' && m.warnings < 3 && (
                        <button className="warn-btn" onClick={() => addWarning(m.email)} style={actionBtnStyle}>경고</button>
                      )}
                      <button className={m.status === '정지됨' ? 'suspend-btn-on' : 'suspend-btn-off'} onClick={() => toggleSuspend(m.email)} style={actionBtnStyle}>
                        {m.status === '정지됨' ? '해제' : '정지'}
                      </button>
                      {m.warnings > 0 && (
                        <button className="reset-btn" onClick={() => resetWarnings(m.email)} style={actionBtnStyle}>초기화</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', borderTop: '0.5px solid #e5e7eb', background: '#fafafa' }}>
            <button 
              disabled={isPrevDisabled} 
              onClick={() => setCurrentPage(p => Math.max(0, Number(p) - 1))} 
              style={{ cursor: isPrevDisabled ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: isPrevDisabled ? '#d1d5db' : '#374151' }}
            >이전</button>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
              {safeCurrentPage + 1} / {safeTotalPages}
            </span>
            <button 
              disabled={isNextDisabled} 
              onClick={() => setCurrentPage(p => Number(p) + 1)} 
              style={{ cursor: isNextDisabled ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: isNextDisabled ? '#d1d5db' : '#374151' }}
            >다음</button>
          </div>
        </TableCard>
        </>
      );
    }


  }
};

const pageMeta: Record<PageId, { title: string; sub: string }> = {
  dashboard:   { title: '잇픽 관리자',         sub: '전체 현황을 확인합니다.' },
  stats:       { title: '통계 / 분석',       sub: '서비스 지표를 확인하세요' },
  restaurants: { title: '맛집 관리',           sub: '등록된 맛집을 관리하세요' },
  categories:  { title: '카테고리 관리',       sub: '맛집 분류 카테고리를 관리하세요' },
  members:     { title: '회원 관리',           sub: '가입 회원을 조회하고 관리하세요' },
};


// ============================================================================
// ─── 7. 최상위 레이아웃 컴포넌트 (사이드바 + 메인 영역 구조) ────────────────
// ============================================================================
export default function Manager() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const { title, sub } = pageMeta[activePage];

  const navLabelStyle: React.CSSProperties = {
    fontSize: '9.5px', fontWeight: 500, color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 8px 5px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* ── 좌측 사이드바 영역 ── */}
      <aside style={{ width: '220px', background: '#910000', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        
        {/* 사이드바 상단 로고/타이틀 */}
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#4d000d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.tool}</div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#ffffff' }}>관리자페이지</div>
              <div style={{ fontSize: '9px', color: '#ffe5e5', background: 'rgba(59,130,246,0.15)', padding: '1px 5px', borderRadius: '3px', marginTop: '2px', width: 'fit-content' }}>Admin</div>
            </div>
          </div>
        </div>
        
        {/* 메뉴 네비게이션 목록 */}
        <nav style={{ padding: '10px 6px', flex: 1 }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={navLabelStyle}>개요</div>
            <NavItem id="dashboard" activePage={activePage} onClick={setActivePage} icon={Icons.dashboard}>대시보드</NavItem>
            <NavItem id="stats"     activePage={activePage} onClick={setActivePage} icon={Icons.stats}>통계 / 분석</NavItem>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={navLabelStyle}>콘텐츠</div>
            <NavItem id="restaurants" activePage={activePage} onClick={setActivePage} icon={Icons.restaurant}>맛집 관리</NavItem>
            <NavItem id="categories"  activePage={activePage} onClick={setActivePage} icon={Icons.category}>카테고리 관리</NavItem>
            {/* <NavItem id="reviews"     activePage={activePage} onClick={setActivePage} icon={Icons.review} badge={3}>댓글 / 리뷰 관리</NavItem> */}
          </div>
          <div>
            <div style={navLabelStyle}>사용자</div>
            <NavItem id="members" activePage={activePage} onClick={setActivePage} icon={Icons.member}>회원 관리</NavItem>
          </div>
        </nav>
        
        {/* 사이드바 하단 관리자 프로필 정보 */}
        <div style={{ padding: '10px 6px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#60a5fa', flexShrink: 0 }}>관</div>
            <div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>관리자</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── 우측 메인 콘텐츠 영역 ── */}
      <main style={{ flex: 1, background: '#f3f4f6', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        <div style={{ padding: '14px 20px', background: '#fff', borderBottom: '0.5px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>{title}</div>
          <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>{sub}</div>
        </div>
        
        <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
          <PageContent page={activePage} />
        </div>
      </main>
    </div>
  );
}