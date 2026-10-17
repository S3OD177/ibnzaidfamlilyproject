// Original sample tree, kept as the source for scripts/build-seed.mjs.
const initialNodes = [
    // Gen 1
    { id: '1', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'الجد المؤسس', role: 'الجيل الأول', gender: 'male', status: 'deceased', serial: '001', mobile: '0500000001', birthDate: { day: '1', month: '1', year: '1300', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1380', type: 'Hijri' } } },

    // Gen 2
    { id: '2', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عبدالله', role: 'الجيل الثاني', gender: 'male', status: 'deceased', serial: '002', mobile: '0500000002', birthDate: { day: '1', month: '1', year: '1330', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1410', type: 'Hijri' } } },
    { id: '3', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'محمد', role: 'الجيل الثاني', gender: 'male', status: 'deceased', serial: '003', mobile: '0500000003', birthDate: { day: '1', month: '1', year: '1335', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1415', type: 'Hijri' } } },
    { id: '7', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'علي', role: 'الجيل الثاني', gender: 'male', status: 'alive', serial: '004', mobile: '0500000004', birthDate: { day: '1', month: '1', year: '1340', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '8', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فاطمة', role: 'الجيل الثاني', gender: 'female', status: 'alive', serial: '005', mobile: '0500000005', birthDate: { day: '1', month: '1', year: '1342', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '9', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'نورة', role: 'الجيل الثاني', gender: 'female', status: 'deceased', serial: '006', mobile: '0500000006', birthDate: { day: '1', month: '1', year: '1345', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 3
    { id: '4', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سارة', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '007', mobile: '0500000007', birthDate: { day: '1', month: '1', year: '1360', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '5', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'أحمد', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '008', mobile: '0500000008', birthDate: { day: '1', month: '1', year: '1362', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '10', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'منيرة', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '009', mobile: '0500000009', birthDate: { day: '1', month: '1', year: '1365', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '11', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'حسن', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '010', mobile: '0500000010', birthDate: { day: '1', month: '1', year: '1368', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '6', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'خالد', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '011', mobile: '0500000011', birthDate: { day: '1', month: '1', year: '1370', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '12', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'ريم', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '012', mobile: '0500000012', birthDate: { day: '1', month: '1', year: '1372', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '13', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فيصل', role: 'الجيل الثالث', gender: 'male', status: 'deceased', serial: '013', mobile: '0500000013', birthDate: { day: '1', month: '1', year: '1375', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '14', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سلطان', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '014', mobile: '0500000014', birthDate: { day: '1', month: '1', year: '1378', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '15', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'لمى', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '015', mobile: '0500000015', birthDate: { day: '1', month: '1', year: '1380', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '16', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عبدالمحسن', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '016', mobile: '0500000016', birthDate: { day: '1', month: '1', year: '1382', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 4
    { id: '17', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عمر', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '017', mobile: '0500000017', birthDate: { day: '1', month: '1', year: '1390', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '18', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'رشا', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '018', mobile: '0500000018', birthDate: { day: '1', month: '1', year: '1392', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '19', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فهد', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '019', mobile: '0500000019', birthDate: { day: '1', month: '1', year: '1395', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '20', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'الجوهرة', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '020', mobile: '0500000020', birthDate: { day: '1', month: '1', year: '1398', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '21', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'تركي', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '021', mobile: '0500000021', birthDate: { day: '1', month: '1', year: '1400', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '22', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'مشعل', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '022', mobile: '0500000022', birthDate: { day: '1', month: '1', year: '1402', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '23', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'لولوة', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '023', mobile: '0500000023', birthDate: { day: '1', month: '1', year: '1402', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 5
    { id: '24', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سعد', role: 'الجيل الخامس', gender: 'male', status: 'alive', serial: '024', mobile: '0500000024', birthDate: { day: '1', month: '1', year: '1420', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '25', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'دانه', role: 'الجيل الخامس', gender: 'female', status: 'alive', serial: '025', mobile: '0500000025', birthDate: { day: '1', month: '1', year: '1422', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '26', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سلمان', role: 'الجيل الخامس', gender: 'male', status: 'alive', serial: '026', mobile: '0500000026', birthDate: { day: '1', month: '1', year: '1425', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '27', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'غادة', role: 'الجيل الخامس', gender: 'female', status: 'alive', serial: '027', mobile: '0500000027', birthDate: { day: '1', month: '1', year: '1428', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
];

const initialEdges = [
    // Gen 1 -> 2
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-7', source: '1', target: '7', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-8', source: '1', target: '8', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-9', source: '1', target: '9', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 2 -> 3
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-10', source: '2', target: '10', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-11', source: '2', target: '11', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-12', source: '3', target: '12', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-13', source: '3', target: '13', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-14', source: '7', target: '14', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-15', source: '7', target: '15', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-16', source: '7', target: '16', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 3 -> 4
    { id: 'e5-17', source: '5', target: '17', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e5-18', source: '5', target: '18', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-19', source: '6', target: '19', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-20', source: '6', target: '20', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-21', source: '6', target: '21', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e14-22', source: '14', target: '22', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e14-23', source: '14', target: '23', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 4 -> 5
    { id: 'e17-24', source: '17', target: '24', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e17-25', source: '17', target: '25', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e19-26', source: '19', target: '26', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e19-27', source: '19', target: '27', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
];
