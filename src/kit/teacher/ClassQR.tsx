/* "Mã QR vào lớp" (phím Q): full-screen code for the projector.
   Students scan → login page with the class code filled in (…/?code=DOL-2026). */
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import { Icon } from '../ui';

export const joinLink = (classCode: string) => `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(classCode)}`;

export const ClassQR: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const room = useClassroom();
  const code = room.classCode;
  const link = code ? joinLink(code) : '';
  const [svg, setSvg] = useState('');
  useEffect(() => {
    if (!link) { setSvg(''); return; }
    let alive = true;
    QRCode.toString(link, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1f2230', light: '#ffffff' } })
      .then((s) => { if (alive) setSvg(s); })
      .catch(() => { if (alive) setSvg(''); });
    return () => { alive = false; };
  }, [link]);
  const copy = () => {
    void navigator.clipboard?.writeText(link).then(() => room.showToast('Đã sao chép link vào lớp'), () => room.showToast(link));
  };

  return (
    <div className="qrwrap" role="dialog" aria-modal="true" aria-label="Mã QR vào lớp" onClick={onClose}>
      <div className="qrcard" onClick={(e) => e.stopPropagation()}>
        <div className="qrimg" aria-label={link ? `Mã QR: ${link}` : 'Chưa có mã lớp'}>
          {/* SVG markup generated locally by the qrcode library from the join link. */}
          {svg ? <div className="qrsvg" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="qrnone">{code ? 'Đang tạo mã…' : 'Chưa chọn lớp'}</div>}
        </div>
        <div className="qrside">
          <div className="tl" style={{ color: '#d63a43' }}>Quét để vào lớp</div>
          <div className="qrlabel">Mã lớp</div>
          <div className="qrcode-big">{code || '—'}</div>
          <ol className="qrsteps">
            <li>Mở camera điện thoại và quét mã</li>
            <li>Nhập <b>họ và tên</b> — mã lớp đã được điền sẵn</li>
            <li>Bấm <b>Vào bài học</b></li>
          </ol>
          <div className="qrlink">{link || 'Tạo hoặc chọn lớp trong ⚙ Cài đặt'}</div>
          <div className="qrjoined"><Icon name="users" size={18} /><b>{room.students.length}</b> học sinh đã vào lớp</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
            <button className="btn btn-soft" onClick={copy} disabled={!link}><Icon name="copy" size={16} />Sao chép link</button>
            <button className="btn btn-red" onClick={onClose}>Đóng (Esc · Q)</button>
          </div>
        </div>
      </div>
    </div>
  );
};
