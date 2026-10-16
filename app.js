'use strict';

/* =========================================================
   NeuroBridge — Neurology HIS / EMR (Dual View)
   ========================================================= */
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const NOW = Date.now();
const DUP_WINDOW = 14 * DAY; // نافذة الفحص المكرر: آخر أسبوعين

/* =========================================================
   اللغة — الثوابت الطبية (الأدوية، الفحوصات، التشخيص، القسم) تبقى بالإنجليزي
   ========================================================= */
let lang = 'ar';
try { lang = localStorage.getItem('nb-lang') || 'ar'; } catch (e) { /* storage blocked */ }

const I18N = {
  ar: {
    'app.subtitle': 'العرض المزدوج (Dual View): جرّب الصلاحيات بين الحسابين لحظياً',
    'tab.res': 'المقيم / الامتياز', 'tab.con': 'الاستشاري',
    'legend.res': 'المقيم (يمين)','legend.con': 'الاستشاري (يسار)', 'reset': '↺ إعادة ضبط البيانات',
    'role.res': 'Resident / Intern', 'role.con': 'Consultant',
    'login.title': 'Log in', 'login.user': 'اسم المستخدم', 'login.pass': 'كلمة المرور', 'login.btn': 'Log in', 'login.err': 'اسم المستخدم أو كلمة المرور غير صحيحة', 'login.demo': 'حسابات تجريبية (اضغط للتعبئة) · كلمة المرور: demo123', 'login.sub': 'اختر حساباً. كل نصف من الشاشة مستقل عن الآخر.',
    'login.go': 'دخول ←', 'login.rules': 'صلاحيات هذا الدور (اضغط على أي خاصية لشرحها):',
    'hdr.resident': 'Resident', 'hdr.intern': 'Intern', 'grp.resident': 'Residents', 'grp.intern': 'Interns',
    'pt.dxLabel': 'التشخيص', 'pt.meds': 'العلاجات الحالية', 'pt.noMeds': 'لا توجد علاجات نشطة',
    'hdr.con': 'Consultant', 'switch': 'تسجيل خروج',
    'remote.hospital': 'في المستشفى', 'remote.home': 'من البيت', 'remote.hint': 'التبديل بين الدخول من المستشفى والدخول من البيت',
    'remote.banner': '<b>وضع المنزل (Remote):</b> الخصائص المتاحة حسب إعداداتك.',
    'remote.blocked': 'أنت تشتغل من البيت، وهذي الخاصية موقوفة في إعداداتك.', 'remote.tag': 'من البيت',
    'remote.toastOn': 'تم التحويل لوضع المنزل', 'remote.toastOff': 'رجعت لوضع المستشفى',
    'f.remote': 'الدخول من البيت (Remote)',
    'remote.toSettings': 'تعديل الإعدادات',
    'nav.schedule': 'المواعيد', 'nav.settings': 'الإعدادات',
    'tab.results': 'النتائج', 'tab.media': 'الصور', 'tab.summary': 'الملخص', 'tab.meds': 'الأدوية',
    'pt.ageSex': 'العمر · الجنس', 'pt.location': 'الموقع',
    'sum.dx': 'التشخيص', 'sum.vitals': 'العلامات الحيوية', 'sum.meds': 'العلاجات الحالية', 'sum.results': 'آخر النتائج',
    'sum.pending': 'طلبات بانتظار النتيجة', 'sum.lastNote': 'آخر نوتة', 'sum.none': 'لا يوجد', 'sum.allResults': 'كل النتائج',
    'ord.awaiting': 'بانتظار النتيجة', 'ord.result': 'النتيجة:', 'ord.report': 'التقرير:',
    'meds.med': 'الدواء', 'meds.dose': 'الجرعة / التكرار', 'meds.by': 'بواسطة', 'meds.since': 'منذ', 'meds.status': 'الحالة',
    'consult.btn': 'طلب استشارة', 'consult.openChip': 'استشارة مفتوحة ({n})',
    'note.conHint': 'كاستشاري، تراجع نوتات المقيمين والامتياز، وتعدّل عليها أو تلغيها من الأزرار على كل نوتة.',
    'toast.resultReady': 'صدرت نتيجة {i} · {p}',
    'set.title': 'إعدادات الدخول من البيت (Remote)',
    'set.sub': 'فعّل الخصائص اللي تحتاجها لما تشتغل من البيت، وأوقف اللي ما تحتاجها. داخل المستشفى كل الخصائص متاحة.',
    'set.count': '{n} من {total} مفعّلة', 'set.all': 'تفعيل الكل', 'set.none': 'إيقاف الكل', 'set.default': 'الافتراضي', 'set.saved': 'تم حفظ الإعداد',
    'set.g.view': 'الاطلاع', 'set.g.comm': 'التواصل', 'set.g.sign': 'الاعتماد والتوقيع', 'set.g.write': 'الكتابة والتعديل',
    'hf.patients': 'قائمة الحالات (Patient Lists)', 'hd.patients': 'يشوف قائمة مرضاه ويفتح ملفاتهم.',
    'hf.results': 'مراجعة النتائج (Results Review)', 'hd.results': 'تبويب النتائج في ملف المريض: تحاليل وتقارير أشعة، مع تمييز غير الطبيعي.',
    'hf.resultAlerts': 'تنبيه النتائج الجديدة', 'hd.resultAlerts': 'قسم في التنبيهات يعرض النتائج اللي ما انراجعت، مع زر «تم الاطلاع».',
    'hf.schedule': 'جدول المواعيد (Schedule)', 'hd.schedule': 'مواعيد العيادة لليوم.',
    'hf.consults': 'الرد على الاستشارات', 'hd.consults': 'يكتب توصية أو يستخدم الردود السريعة على استشارات المقيمين.',
    'hf.inbasket': 'صندوق الرسائل (In Basket)', 'hd.inbasket': 'كل التنبيهات اللي وصلته في مكان واحد، مع تحديد المقروء.',
    'hf.approvals': 'الموافقة على الطلبات المقيدة', 'hd.approvals': 'يوافق أو يرفض الأدوية المقيدة والأشعة بالصبغة.',
    'hf.cosign': 'التوقيع على أعمال المقيمين (Cosign)', 'hd.cosign': 'يوقّع على نوتات وأوامر المقيمين والامتياز.',
    'hf.notes': 'كتابة نوتات (Notes Entry)', 'hd.notes': 'يضيف نوتات جديدة في ملف المريض.',
    'hf.orders': 'كتابة أوامر (Ordering)', 'hd.orders': 'يطلب تحاليل وأشعة وأدوية.',
    'hf.eRx': 'الوصفة الإلكترونية (E-Prescribing)', 'hd.eRx': 'يرسل وصفة دواء لصيدلية مريض العيادة.',
    'hf.edit': 'تعديل وإلغاء أعمال المقيمين', 'hd.edit': 'Edit / Override / Cancel على نوتات وأوامر المقيمين.',
    'hf.media': 'إرفاق صور (Media Capture)', 'hd.media': 'يرفع صورة لملف المريض، مثل صورة جرح أو تقرير ورقي.',
    'res.labs': 'التحاليل', 'res.imaging': 'تقارير الأشعة والتخطيط', 'res.test': 'الفحص', 'res.value': 'النتيجة', 'res.ref': 'الطبيعي', 'res.time': 'الوقت',
    'res.new': 'جديد', 'res.markReviewed': 'تم الاطلاع', 'res.none': 'لا توجد نتائج',
    'flag.H': 'مرتفع', 'flag.L': 'منخفض', 'flag.N': 'طبيعي', 'flag.abn': 'غير طبيعي',
    'alerts.newResults': 'نتائج جديدة لم تُراجع', 'alerts.noResults': 'لا توجد نتائج جديدة',
    'alerts.cosign': 'تنتظر توقيعك (Cosign)', 'alerts.noCosign': 'لا يوجد شي ينتظر توقيعك',
    'alerts.inbox': 'صندوق الرسائل (In Basket)', 'alerts.inboxEmpty': 'الصندوق فاضي', 'alerts.markAll': 'تحديد الكل كمقروء',
    'cs.btn': 'توقيع (Cosign)', 'cs.done': 'وقّعه {u} · {t}', 'cs.wait': 'بانتظار توقيع الاستشاري', 'cs.note': 'نوتتك', 'cs.order': 'أمرك',
    'sch.title': 'مواعيد العيادة اليوم', 'sch.open': 'فتح الملف', 'sch.noFile': 'مريض جديد: لا يوجد ملف',
    'media.add': 'إرفاق صورة', 'media.caption': 'وصف الصورة (اختياري)', 'media.upload': 'رفع', 'media.empty': 'لا توجد صور',
    'erx.label': 'إرسال كوصفة إلكترونية للصيدلية (e-Rx)', 'erx.chip': 'e-Rx أُرسلت للصيدلية',
    'toast.reviewed': 'تم تسجيل الاطلاع', 'toast.cosigned': 'تم التوقيع', 'toast.cosignedRes': '{u} وقّع على {what} في ملف {p}',
    'toast.mediaAdded': 'تم إرفاق الصورة', 'toast.resultNew': 'نتيجة جديدة: {r} · {p}',
    'i.remote': 'مثل تطبيقات Epic للجوال (Haiku) والآيباد (Canto): الاستشاري يحدد بنفسه من «الإعدادات» وش الخصائص اللي يحتاجها من البيت: النتائج، الاستشارات، الموافقات، التوقيع، تعديل النوتات، كتابة الأوامر، وغيرها. داخل المستشفى كل الخصائص متاحة، واللي ينسوى من البيت ينعلّم بـ «من البيت».',
    'nav.alerts': 'الطوارئ والتنبيهات', 'nav.patients': 'المرضى (Documentation)', 'nav.access': 'منح الصلاحيات (Allow Access)',
    'filter.all': 'الكل', 'set.in': 'In-pt — تنويم', 'set.out': 'Out-pt — عيادات', 'set.er': 'ER — طوارئ',
    'lvl.read': 'Read-only — اطلاع فقط', 'lvl.write': 'Note-write — اطلاع + نوتات + أوامر',
    'res.permsTitle': 'صلاحياتك كطبيب مقيم', 'res.permsSub': 'تُمنح من الاستشاري لكل مريض على حدة (Allow Access). اضغط على أي خاصية لشرحها.',
    'res.myPatients': 'مرضاي المصرّح لي بهم', 'res.noneInSection': 'لا يوجد مرضى في هذا القسم',
    'res.noGrants': 'لا توجد صلاحيات دخول حالياً. اطلب من الاستشاري منحك الوصول.', 'res.myConsults': 'استشاراتي المرسلة',
    'empty.consults': 'لا توجد استشارات', 'empty.notes': 'لا توجد نوتات', 'empty.orders': 'لا توجد أوامر', 'empty.none': 'لا يوجد',
    'pt.under': 'تحت اسم {c}', 'pt.openConsults': '{n} استشارة مفتوحة', 'pt.pending': '{n} بانتظار الموافقة', 'pt.years': '{n} سنة',
    'sex.m': 'ذكر', 'sex.f': 'أنثى',
    'con.underName': 'تحت اسمي (Under-Name)', 'con.others': 'مرضى استشاريين آخرين', 'con.allergyChip': 'حساسية', 'con.noResidents': 'لا يوجد مقيمون مصرّح لهم',
    'stat.em': 'استشارات طارئة مفتوحة', 'stat.open': 'إجمالي المفتوحة', 'stat.pending': 'طلبات موافقة', 'stat.overdue': 'متأخرة عن الوقت',
    'alerts.consults': 'طلبات الاستشارة: الأقرب للانتهاء أولاً', 'alerts.noOpen': 'لا توجد استشارات مفتوحة ',
    'alerts.approvals': 'طلبات موافقة على أوامر مقيدة', 'alerts.noReq': 'لا توجد طلبات', 'alerts.justified': 'فحوصات مكررة أُرسلت بمبرر',
    'alerts.answered': '✓ استشارات تم الرد عليها', 'alerts.filtered': 'عرض: {f}', 'alerts.showAll': 'عرض الكل ✕',
    'access.title': 'Allow Access: منح صلاحيات الدخول',
    'access.sub': 'اختر المقيم، ثم حدّد مرضاك (Under-Name) ومستوى الصلاحية. التغيير يظهر في واجهة المقيم فوراً.',
    'access.note': 'ملاحظة: صلاحية <b>Edit</b> (تعديل/إلغاء) خاصة بالاستشاري فقط ولا يمكن منحها للمقيم.',
    'access.noRes': 'لا يوجد مقيمون تابعون لك', 'access.toggle': 'السماح بالدخول',
    'pt.back': '→ رجوع', 'pt.readonly': 'صلاحيتك على هذا الملف <b>Read-only</b>. لا يمكنك إضافة نوتات أو أوامر.',
    'pt.underYou': 'تحت اسمك', 'pt.fullAccess': 'وصول كامل', 'pt.consultant': 'الاستشاري:', 'pt.allergy': 'حساسية: {a}', 'pt.noAllergy': 'لا توجد حساسية معروفة',
    'tab.notes': 'النوتات', 'tab.orders': 'الأوامر الطبية', 'tab.consults': 'الاستشارات',
    'note.add': 'إضافة نوتة طبية (Progress Note)', 'note.ph': 'اكتب الملاحظة الطبية...', 'note.lockHint': 'بعد الحفظ لا يمكنك تعديل النوتة أو حذفها', 'note.save': 'حفظ النوتة',
    'note.edited': '✎ عُدّلت بواسطة {u} · {t}', 'note.original': 'عرض النص الأصلي', 'note.voided': 'أُلغيت بواسطة {u}',
    'lock.short': 'مقفل', 'lock.res': 'لا يمكن للمقيم التعديل أو الحذف', 'lock.notYours': 'ليست لمقيم تابع لك',
    'btn.edit': '✎ تعديل', 'btn.void': 'إلغاء', 'btn.undo': 'تراجع', 'btn.saveEdit': 'حفظ التعديل',
    'btn.reject': '✗ رفض', 'btn.approve': '✓ موافقة', 'btn.cancelOrder': 'إلغاء الأمر',
    'order.new': 'طلب جديد', 'order.initial': '(أمر مبدئي)', 'order.detailsPh': 'الجرعة / التفاصيل / الملاحظات (اختياري)',
    'order.hint': 'المقيدة تحتاج موافقة الاستشاري · الفحص المكرر يحتاج مبرر', 'order.send': 'إرسال الطلب', 'order.lockFoot': 'لا يمكن التعديل أو الحذف',
    'order.justification': 'فحص مكرر. المبرر الطبي:', 'order.reqReason': 'سبب طلب الموافقة:', 'order.approved': '✓ اعتمده {u} · {t}',
    'order.modified': '✎ عدّله {u} · {t}', 'order.was': 'كان:', 'order.cancelledBy': 'أُلغي بواسطة {u}', 'order.rejectedBy': 'رُفض بواسطة {u}',
    'consult.req': 'طلب استشارة من الاستشاري: {c}', 'consult.h': '{n} س', 'consult.ph': 'اكتب سؤالك أو وصف الحالة...', 'consult.send': 'إرسال الاستشارة',
    'consult.answeredIn': '✓ تم الرد خلال {n} د', 'consult.fromTo': 'من {a} ← إلى {b} · {t}', 'consult.replyPh': 'اكتب توصيتك أو ردّك...', 'consult.sendReply': 'إرسال التوصية',
    'modal.dupTitle': 'تنبيه: فحص مشابه خلال آخر أسبوعين',
    'modal.dupBody': '<b class="ltr">{i}</b> تم لهذا المريض <b>{ago}</b> ({time}): {src}.',
    'modal.dupHint': 'الطلب لن يُرفض، لكن لازم تكتب مبرر طبي واضح لإرساله.', 'modal.dupPh': 'مثال: نوبة جديدة مع تغيّر في مستوى الوعي...',
    'modal.cancelReq': 'إلغاء الطلب', 'modal.sendJust': 'إرسال مع المبرر', 'src.result': 'نتيجة موجودة في الملف', 'src.order': 'طلب سابق بواسطة {u}',
    'modal.rTitle': 'غير مسموح للمقيم بطلب هذا مباشرة', 'modal.rClass': '<b class="ltr">{i}</b> مصنّف كـ {c}',
    'modal.rBody': 'صلاحيات المقيم لا تشمل الأدوية المقيدة أو المخدرة، ولا الأشعة بالصبغة أو عالية التكلفة. تقدر ترسل طلب موافقة لـ {c}.',
    'modal.rPh': 'السبب الإكلينيكي للطلب...', 'modal.close': 'إلغاء', 'modal.sendApproval': 'إرسال طلب موافقة للاستشاري',
    'modal.reject': 'رفض الطلب', 'modal.voidNote': 'إلغاء النوتة', 'modal.cancelOrder': 'إلغاء الأمر الطبي',
    'modal.reasonVisible': 'السبب سيظهر للمقيم وفريق المريض.', 'modal.reasonPh': 'السبب (اختياري)', 'modal.back': 'تراجع', 'modal.confirm': 'تأكيد', 'modal.gotIt': 'فهمت',
    'toast.readonly': 'صلاحيتك Read-only على هذا الملف', 'toast.noteSavedRes': '✓ تم حفظ النوتة، ولم تعد قابلة للتعديل من طرفك',
    'toast.noteNew': 'نوتة جديدة من {u}: {p}', 'toast.noteSaved': '✓ تم حفظ النوتة', 'toast.noteNewCon': 'نوتة جديدة من الاستشاري {u}: {p}',
    'toast.pendingSent': 'أُرسل طلب الموافقة لـ {c}', 'toast.pendingNew': 'طلب موافقة: <b>{i}</b> لـ {p} من {u}',
    'toast.justSent': '✓ أُرسل الطلب مع المبرر الطبي', 'toast.justNew': 'فحص مكرر بمبرر: {i} لـ {p} ({u})',
    'toast.orderSent': '✓ تم إرسال الطلب: {i}', 'toast.orderNew': 'أمر جديد من {u}: {i} لـ {p}', 'toast.orderNewCon': 'أمر جديد من الاستشاري: {i} لـ {p}',
    'toast.replySent': '✓ أُرسلت التوصية', 'toast.replyNew': 'ردّ {u} على استشارة {p}', 'toast.replyTeam': 'توصية جديدة من الاستشاري على ملف {p}',
    'toast.noAccess': 'لا تملك صلاحية دخول لهذا الملف', 'toast.editSaved': '✓ حُفظ التعديل', 'toast.noteEdited': '✎ {u} عدّل نوتتك في ملف {p}',
    'toast.orderEditSaved': '✓ حُفظ التعديل على الأمر', 'toast.orderEdited': '✎ {u} عدّل أمرك: {i} ({p})',
    'toast.approved': '✓ تمت الموافقة', 'toast.approvedNew': '{u} وافق على طلبك: {i} ({p})',
    'toast.consultSent': '✓ أُرسلت الاستشارة إلى {c}', 'toast.consultNew': 'استشارة {l} جديدة: {p} من {u}',
    'toast.noteVoided': '{u} ألغى نوتتك في ملف {p}', 'toast.orderCancelled': '{u} ألغى أمرك: {i} ({p})', 'toast.cancelled': 'تم الإلغاء',
    'toast.rejected': 'تم رفض الطلب', 'toast.rejectedNew': '{u} رفض طلبك: {i} ({p})',
    'toast.granted': '{u} منحك صلاحية <b>Read-only</b> لملف {p}', 'toast.grantedCon': '✓ مُنح {r} الدخول لملف {p}',
    'toast.revoked': 'سُحبت صلاحية دخولك لملف {p}', 'toast.revokedCon': 'تم سحب صلاحية {r}',
    'toast.levelChanged': 'تغيّرت صلاحيتك على ملف {p} إلى <b>{l}</b>', 'toast.levelUpdated': '✓ حُدّث مستوى الصلاحية',
    'time.now': 'الآن', 'time.min': 'قبل {n} د', 'time.h': 'قبل {n} س', 'time.d': 'قبل {n} يوم',
    'timer.left': 'متبقي {t}', 'timer.over': 'متأخر {t}',
    'type.lab': 'تحليل', 'type.rad': 'أشعة', 'type.med': 'دواء',
    'urg.emergency': 'طارئ', 'urg.urgent': 'عاجل', 'urg.routine': 'روتيني',
    'st.active': 'نشط', 'st.pending': 'بانتظار موافقة الاستشاري', 'st.modified': 'معدّل من الاستشاري', 'st.cancelled': 'ملغي', 'st.rejected': 'مرفوض',
    'reason.contrast': 'أشعة بالصبغة', 'reason.cost': 'عالية التكلفة', 'reason.contrastCost': 'بالصبغة وعالية التكلفة', 'reason.controlled': 'مخدّر — Controlled',
    'reason.highAlert': 'عالي الخطورة — High-Alert', 'reason.thrombolytic': 'عالي الخطورة — Thrombolytic', 'reason.restricted': 'دواء مقيد',
    quick: ['سأحضر لتقييم المريض خلال 15 دقيقة', 'موافق على الخطة، استمر', 'أوقف الأمر الحالي وانتظر تقييمي', 'اطلب استشارة من التخصص المعني'],
    // شرح الخصائص (عند الضغط على أيقونات الصلاحيات)
    'f.view': '✓ الاطلاع على الملف والاستشارات', 'f.notes': '✓ كتابة نوتات', 'f.orders': '✓ أوامر مبدئية', 'f.dup': 'تنبيه الفحص المكرر',
    'f.noEdit': '✗ تعديل أو حذف أي سجل سابق', 'f.noRestricted': '✗ أدوية مقيدة / مخدرة', 'f.noContrast': '✗ CT بالصبغة · MRI · MRA',
    'f.full': '✓ وصول كامل', 'f.override': '✓ تعديل وإلغاء أعمال المقيمين', 'f.grant': '✓ منح الصلاحيات (Allow Access)', 'f.er': '✓ لوحة الطوارئ', 'f.approve': '✓ اعتماد الطلبات المقيدة',
    'i.view': 'المقيم يشوف ملف المريض كامل: النوتات، الأوامر، الاستشارات، العلامات الحيوية والحساسية. وهذا فقط للمرضى اللي منحه الاستشاري صلاحية لهم.',
    'i.notes': 'مع صلاحية Note-write يقدر المقيم يضيف Progress Notes. بمجرد الحفظ تنقفل النوتة ولا يقدر يعدّلها أو يحذفها.',
    'i.orders': 'المقيم يقدر يطلب تحاليل وأشعة وأدوية أساسية. الأوامر تظهر للاستشاري لحظياً ويقدر يعدّلها أو يلغيها.',
    'i.dup': 'إذا طلب المقيم فحص تم للمريض خلال آخر 14 يوم، يطلع تنبيه بتاريخ الفحص السابق ويُطلب منه مبرر طبي. الطلب ما يُرفض، لكنه يوصل للاستشاري مع المبرر.',
    'i.noEdit': 'أي نوتة أو أمر محفوظ ما يقدر المقيم يغيّره. التعديل (Edit) صلاحية للاستشاري فقط، ويبقى النص الأصلي محفوظ للمراجعة.',
    'i.noRestricted': 'أدوية مثل Lyrica والمخدرات (Morphine, Fentanyl, Midazolam) والأدوية عالية الخطورة (tPA, KCl) ممنوعة مباشرة. المقيم يرسل طلب موافقة، والاستشاري يعتمده أو يرفضه.',
    'i.noContrast': 'CT with Contrast و CTA و MRI و MRA تحتاج موافقة الاستشاري قبل التنفيذ.',
    'i.full': 'الاستشاري يفتح كل ملفات المرضى ويطلب أي دواء أو فحص بدون قيود أو تنبيهات.',
    'i.override': 'Edit / Override / Cancel على نوتات وأوامر المقيمين التابعين له. التعديل يظهر عند المقيم فوراً بلون مميز مع تنبيه، والنص الأصلي يبقى محفوظ.',
    'i.grant': 'الاستشاري يختار مرضى من قائمته (Under-Name) ويمنح كل مقيم صلاحية Read-only أو Note-write. السحب أو التغيير يطبّق لحظياً.',
    'i.er': 'كل استشارة لها عداد تنازلي حسب الأولوية: طارئ (ساعة)، عاجل (4 ساعات)، روتيني (24 ساعة). اللون يتغير كل ما قرب الوقت، والرد يوصل للمقيم وفريق المريض فوراً.',
    'i.approve': 'طلبات المقيمين للأدوية المقيدة والأشعة بالصبغة تنتظر في لوحة التنبيهات. الاستشاري يوافق أو يرفض مع ذكر السبب، والنتيجة توصل للمقيم فوراً.',
  },
  en: {
    'app.subtitle': 'Dual View: test permissions between both accounts in real time',
    'tab.res': 'Resident / Intern', 'tab.con': 'Consultant',
    'legend.res': 'Resident (right)','legend.con': 'Consultant (left)', 'reset': '↺ Reset data',
    'role.res': 'Resident / Intern', 'role.con': 'Consultant',
    'login.title': 'Log in', 'login.user': 'Username', 'login.pass': 'Password', 'login.btn': 'Log in', 'login.err': 'Incorrect username or password', 'login.demo': 'Demo accounts (tap to fill) · password: demo123', 'login.sub': 'Pick an account. Each half of the screen is independent.',
    'login.go': 'Sign in →', 'login.rules': 'Role permissions (click any feature for details):',
    'hdr.resident': 'Resident', 'hdr.intern': 'Intern', 'grp.resident': 'Residents', 'grp.intern': 'Interns',
    'pt.dxLabel': 'Diagnosis', 'pt.meds': 'Active medications', 'pt.noMeds': 'No active medications',
    'hdr.con': 'Consultant', 'switch': 'Log out',
    'remote.hospital': 'At hospital', 'remote.home': 'From home', 'remote.hint': 'Switch between hospital and home access',
    'remote.banner': '<b>Home mode (Remote):</b> available features follow your settings.',
    'remote.blocked': 'You are working from home, and this feature is off in your settings.', 'remote.tag': 'from home',
    'remote.toastOn': 'Switched to home mode', 'remote.toastOff': 'Back to hospital mode',
    'f.remote': 'Access from home (Remote)',
    'remote.toSettings': 'Edit settings',
    'nav.schedule': 'Schedule', 'nav.settings': 'Settings',
    'tab.results': 'Results', 'tab.media': 'Media', 'tab.summary': 'Summary', 'tab.meds': 'Medications',
    'pt.ageSex': 'Age · Sex', 'pt.location': 'Location',
    'sum.dx': 'Diagnosis', 'sum.vitals': 'Vital signs', 'sum.meds': 'Active medications', 'sum.results': 'Latest results',
    'sum.pending': 'Orders awaiting results', 'sum.lastNote': 'Latest note', 'sum.none': 'None', 'sum.allResults': 'All results',
    'ord.awaiting': 'Awaiting result', 'ord.result': 'Result:', 'ord.report': 'Report:',
    'meds.med': 'Medication', 'meds.dose': 'Dose / frequency', 'meds.by': 'Ordered by', 'meds.since': 'Since', 'meds.status': 'Status',
    'consult.btn': 'Request consult', 'consult.openChip': 'Open consult ({n})',
    'note.conHint': 'As consultant, you review residents’ and interns’ notes and can edit or void them with the buttons on each note.',
    'toast.resultReady': 'Result ready: {i} · {p}',
    'set.title': 'Home access settings (Remote)',
    'set.sub': 'Turn on the features you need when working from home and turn off the rest. At the hospital, every feature is available.',
    'set.count': '{n} of {total} on', 'set.all': 'Turn all on', 'set.none': 'Turn all off', 'set.default': 'Defaults', 'set.saved': 'Setting saved',
    'set.g.view': 'Review', 'set.g.comm': 'Communication', 'set.g.sign': 'Approval & signing', 'set.g.write': 'Writing & editing',
    'hf.patients': 'Patient Lists', 'hd.patients': 'See the patient list and open charts.',
    'hf.results': 'Results Review', 'hd.results': 'Results tab in the chart: labs and imaging reports, with abnormal values flagged.',
    'hf.resultAlerts': 'New result alerts', 'hd.resultAlerts': 'An alerts section listing results not yet reviewed, with a Reviewed button.',
    'hf.schedule': 'Schedule', 'hd.schedule': 'Today’s clinic appointments.',
    'hf.consults': 'Reply to consults', 'hd.consults': 'Write a recommendation or use quick replies on residents’ consults.',
    'hf.inbasket': 'In Basket', 'hd.inbasket': 'Every notification in one place, with read tracking.',
    'hf.approvals': 'Approve restricted orders', 'hd.approvals': 'Approve or reject restricted drugs and contrast imaging.',
    'hf.cosign': 'Cosign residents’ work', 'hd.cosign': 'Cosign notes and orders written by residents and interns.',
    'hf.notes': 'Notes Entry', 'hd.notes': 'Add new notes to the chart.',
    'hf.orders': 'Ordering', 'hd.orders': 'Order labs, imaging and medications.',
    'hf.eRx': 'E-Prescribing', 'hd.eRx': 'Send a prescription to the clinic patient’s pharmacy.',
    'hf.edit': 'Edit & cancel residents’ work', 'hd.edit': 'Edit / Override / Cancel residents’ notes and orders.',
    'hf.media': 'Media Capture', 'hd.media': 'Attach a photo to the chart, such as a wound or a paper report.',
    'res.labs': 'Labs', 'res.imaging': 'Imaging & neurophysiology reports', 'res.test': 'Test', 'res.value': 'Result', 'res.ref': 'Reference', 'res.time': 'Time',
    'res.new': 'New', 'res.markReviewed': 'Reviewed', 'res.none': 'No results',
    'flag.H': 'High', 'flag.L': 'Low', 'flag.N': 'Normal', 'flag.abn': 'Abnormal',
    'alerts.newResults': 'New results not yet reviewed', 'alerts.noResults': 'No new results',
    'alerts.cosign': 'Waiting for your cosign', 'alerts.noCosign': 'Nothing waiting for your cosign',
    'alerts.inbox': 'In Basket', 'alerts.inboxEmpty': 'In Basket is empty', 'alerts.markAll': 'Mark all as read',
    'cs.btn': 'Cosign', 'cs.done': 'Cosigned by {u} · {t}', 'cs.wait': 'Awaiting consultant cosign', 'cs.note': 'your note', 'cs.order': 'your order',
    'sch.title': 'Today’s clinic', 'sch.open': 'Open chart', 'sch.noFile': 'New patient: no chart yet',
    'media.add': 'Attach a photo', 'media.caption': 'Caption (optional)', 'media.upload': 'Upload', 'media.empty': 'No photos',
    'erx.label': 'Send as e-prescription to pharmacy (e-Rx)', 'erx.chip': 'e-Rx sent to pharmacy',
    'toast.reviewed': 'Marked as reviewed', 'toast.cosigned': 'Cosigned', 'toast.cosignedRes': '{u} cosigned {what} on {p}',
    'toast.mediaAdded': 'Photo attached', 'toast.resultNew': 'New result: {r} · {p}',
    'i.remote': 'Like Epic’s phone (Haiku) and iPad (Canto) apps: the consultant chooses in Settings which features to use from home: results, consults, approvals, cosign, editing notes, ordering, and more. At the hospital every feature is available, and anything done from home is tagged “from home”.',
    'nav.alerts': 'Emergency & Alerts', 'nav.patients': 'Patients (Documentation)', 'nav.access': 'Allow Access',
    'filter.all': 'All', 'set.in': 'In-pt — Inpatient', 'set.out': 'Out-pt — Clinics', 'set.er': 'ER — Emergency',
    'lvl.read': 'Read-only — View only', 'lvl.write': 'Note-write — View + Notes + Orders',
    'res.permsTitle': 'Your permissions as a Resident', 'res.permsSub': 'Granted by the consultant per patient (Allow Access). Click any feature for details.',
    'res.myPatients': 'My authorized patients', 'res.noneInSection': 'No patients in this section',
    'res.noGrants': 'No access granted yet. Ask the consultant to grant access.', 'res.myConsults': 'My sent consultations',
    'empty.consults': 'No consultations', 'empty.notes': 'No notes', 'empty.orders': 'No orders', 'empty.none': 'None',
    'pt.under': 'Under {c}', 'pt.openConsults': '{n} open consult(s)', 'pt.pending': '{n} awaiting approval', 'pt.years': '{n} y',
    'sex.m': 'Male', 'sex.f': 'Female',
    'con.underName': 'Under my name (Under-Name)', 'con.others': 'Other consultants’ patients', 'con.allergyChip': 'Allergy', 'con.noResidents': 'No residents authorized',
    'stat.em': 'Open emergencies', 'stat.open': 'Total open', 'stat.pending': 'Approval requests', 'stat.overdue': 'Overdue',
    'alerts.consults': 'Consult requests — soonest deadline first', 'alerts.noOpen': 'No open consultations',
    'alerts.approvals': 'Restricted order approvals', 'alerts.noReq': 'No requests', 'alerts.justified': 'Duplicate tests sent with justification',
    'alerts.answered': '✓ Answered consultations', 'alerts.filtered': 'Showing: {f}', 'alerts.showAll': 'Show all ✕',
    'access.title': 'Allow Access',
    'access.sub': 'Pick a resident, then choose patients under your name and the access level. Changes appear on the resident side instantly.',
    'access.note': 'Note: <b>Edit</b> (modify/cancel) is consultant-only and cannot be granted to residents.',
    'access.noRes': 'No residents under your supervision', 'access.toggle': 'Allow access',
    'pt.back': '← Back', 'pt.readonly': 'Your access to this chart is <b>Read-only</b>. You cannot add notes or orders.',
    'pt.underYou': 'Under your name', 'pt.fullAccess': 'Full access', 'pt.consultant': 'Consultant:', 'pt.allergy': 'Allergy: {a}', 'pt.noAllergy': 'No known allergies',
    'tab.notes': 'Notes', 'tab.orders': 'Orders', 'tab.consults': 'Consults',
    'note.add': 'Add Progress Note', 'note.ph': 'Write the clinical note...', 'note.lockHint': 'Once saved, you cannot edit or delete this note', 'note.save': 'Save note',
    'note.edited': '✎ Edited by {u} · {t}', 'note.original': 'Show original text', 'note.voided': 'Voided by {u}',
    'lock.short': 'Locked', 'lock.res': 'Residents cannot edit or delete', 'lock.notYours': 'Not from a resident under you',
    'btn.edit': '✎ Edit', 'btn.void': 'Void', 'btn.undo': 'Discard', 'btn.saveEdit': 'Save changes',
    'btn.reject': '✗ Reject', 'btn.approve': '✓ Approve', 'btn.cancelOrder': 'Cancel order',
    'order.new': 'New order', 'order.initial': '(initial order)', 'order.detailsPh': 'Dose / details / notes (optional)',
    'order.hint': 'Restricted items need approval · Duplicate tests need justification', 'order.send': 'Submit order', 'order.lockFoot': 'Cannot edit or delete',
    'order.justification': 'Duplicate test. Justification:', 'order.reqReason': 'Reason for approval request:', 'order.approved': '✓ Approved by {u} · {t}',
    'order.modified': '✎ Modified by {u} · {t}', 'order.was': 'Was:', 'order.cancelledBy': 'Cancelled by {u}', 'order.rejectedBy': 'Rejected by {u}',
    'consult.req': 'Request consultation from the consultant: {c}', 'consult.h': '{n}h', 'consult.ph': 'Describe the case or your question...', 'consult.send': 'Send consultation',
    'consult.answeredIn': '✓ Answered in {n} min', 'consult.fromTo': 'From {a} → to {b} · {t}', 'consult.replyPh': 'Write your recommendation...', 'consult.sendReply': 'Send recommendation',
    'modal.dupTitle': 'Alert: similar test within the last 2 weeks',
    'modal.dupBody': '<b class="ltr">{i}</b> was done for this patient <b>{ago}</b> ({time}): {src}.',
    'modal.dupHint': 'The order will not be blocked, but a clear clinical justification is required.', 'modal.dupPh': 'e.g. new seizure with change in consciousness...',
    'modal.cancelReq': 'Cancel order', 'modal.sendJust': 'Submit with justification', 'src.result': 'result on file', 'src.order': 'previous order by {u}',
    'modal.rTitle': 'Residents cannot order this directly', 'modal.rClass': '<b class="ltr">{i}</b> is classified as {c}',
    'modal.rBody': 'Resident privileges exclude restricted/controlled drugs and contrast or high-cost imaging. You can send an approval request to {c}.',
    'modal.rPh': 'Clinical reason for the request...', 'modal.close': 'Cancel', 'modal.sendApproval': 'Send approval request',
    'modal.reject': 'Reject request', 'modal.voidNote': 'Void note', 'modal.cancelOrder': 'Cancel order',
    'modal.reasonVisible': 'The reason will be visible to the resident and care team.', 'modal.reasonPh': 'Reason (optional)', 'modal.back': 'Back', 'modal.confirm': 'Confirm', 'modal.gotIt': 'Got it',
    'toast.readonly': 'You have Read-only access to this chart', 'toast.noteSavedRes': '✓ Note saved. It is now locked for you',
    'toast.noteNew': 'New note from {u}: {p}', 'toast.noteSaved': '✓ Note saved', 'toast.noteNewCon': 'New note from consultant {u}: {p}',
    'toast.pendingSent': 'Approval request sent to {c}', 'toast.pendingNew': 'Approval request: <b>{i}</b> for {p} from {u}',
    'toast.justSent': '✓ Order sent with justification', 'toast.justNew': 'Justified duplicate: {i} for {p} ({u})',
    'toast.orderSent': '✓ Order submitted: {i}', 'toast.orderNew': 'New order from {u}: {i} for {p}', 'toast.orderNewCon': 'New consultant order: {i} for {p}',
    'toast.replySent': '✓ Recommendation sent', 'toast.replyNew': '{u} replied to the consult for {p}', 'toast.replyTeam': 'New consultant recommendation on {p}',
    'toast.noAccess': 'You have no access to this chart', 'toast.editSaved': '✓ Changes saved', 'toast.noteEdited': '✎ {u} edited your note on {p}',
    'toast.orderEditSaved': '✓ Order updated', 'toast.orderEdited': '✎ {u} modified your order: {i} ({p})',
    'toast.approved': '✓ Approved', 'toast.approvedNew': '{u} approved your request: {i} ({p})',
    'toast.consultSent': '✓ Consultation sent to {c}', 'toast.consultNew': 'New {l} consult: {p} from {u}',
    'toast.noteVoided': '{u} voided your note on {p}', 'toast.orderCancelled': '{u} cancelled your order: {i} ({p})', 'toast.cancelled': 'Cancelled',
    'toast.rejected': 'Request rejected', 'toast.rejectedNew': '{u} rejected your request: {i} ({p})',
    'toast.granted': '{u} granted you <b>Read-only</b> access to {p}', 'toast.grantedCon': '✓ {r} can now access {p}',
    'toast.revoked': 'Your access to {p} was revoked', 'toast.revokedCon': 'Access revoked for {r}',
    'toast.levelChanged': 'Your access to {p} changed to <b>{l}</b>', 'toast.levelUpdated': '✓ Access level updated',
    'time.now': 'just now', 'time.min': '{n} min ago', 'time.h': '{n}h ago', 'time.d': '{n}d ago',
    'timer.left': '{t} left', 'timer.over': 'Overdue {t}',
    'type.lab': 'Lab', 'type.rad': 'Imaging', 'type.med': 'Medication',
    'urg.emergency': 'Emergency', 'urg.urgent': 'Urgent', 'urg.routine': 'Routine',
    'st.active': 'Active', 'st.pending': 'Awaiting consultant approval', 'st.modified': 'Modified by consultant', 'st.cancelled': 'Cancelled', 'st.rejected': 'Rejected',
    'reason.contrast': 'Contrast imaging', 'reason.cost': 'High cost', 'reason.contrastCost': 'Contrast & high cost', 'reason.controlled': 'Controlled drug',
    'reason.highAlert': 'High-Alert medication', 'reason.thrombolytic': 'High-Alert — Thrombolytic', 'reason.restricted': 'Restricted drug',
    quick: ['I will assess the patient within 15 minutes', 'Agree with the plan, continue', 'Hold current order until my review', 'Request a consult from the relevant specialty'],
    'f.view': '✓ View chart & consultations', 'f.notes': '✓ Write notes', 'f.orders': '✓ Initial orders', 'f.dup': 'Duplicate test alert',
    'f.noEdit': '✗ Edit or delete previous entries', 'f.noRestricted': '✗ Restricted / controlled drugs', 'f.noContrast': '✗ Contrast CT · MRI · MRA',
    'f.full': '✓ Full access', 'f.override': '✓ Edit & override residents', 'f.grant': '✓ Allow Access', 'f.er': '✓ Emergency dashboard', 'f.approve': '✓ Approve restricted orders',
    'i.view': 'Residents can view the full chart (notes, orders, consultations, vitals and allergies), only for patients the consultant has granted.',
    'i.notes': 'With Note-write, residents add progress notes. Once saved, a note is locked: they cannot edit or delete it.',
    'i.orders': 'Residents can place basic labs, imaging and medications. Orders appear instantly to the consultant, who can modify or cancel them.',
    'i.dup': 'If a resident orders a test done within the last 14 days, an alert shows the previous date and asks for a clinical justification. The order is not blocked; it reaches the consultant with the justification.',
    'i.noEdit': 'Residents cannot change any saved note or order. Edit is a consultant-only privilege, and the original text is kept for audit.',
    'i.noRestricted': 'Drugs like Lyrica, controlled drugs (Morphine, Fentanyl, Midazolam) and high-alert meds (tPA, KCl) are blocked. The resident sends an approval request; the consultant approves or rejects it.',
    'i.noContrast': 'CT with Contrast, CTA, MRI and MRA require consultant approval before they are performed.',
    'i.full': 'The consultant can open every patient chart and order any medication or test without restrictions or alerts.',
    'i.override': 'Edit / Override / Cancel residents’ notes and orders. Changes appear instantly on the resident side, highlighted with an alert, and the original text is preserved.',
    'i.grant': 'The consultant picks patients under their name and grants each resident Read-only or Note-write. Revoking or changing takes effect instantly.',
    'i.er': 'Each consultation has a countdown by priority: Emergency (1h), Urgent (4h), Routine (24h). The color changes as the deadline nears, and replies reach the resident and care team instantly.',
    'i.approve': 'Residents’ requests for restricted drugs and contrast imaging wait in the alerts dashboard. The consultant approves or rejects with a reason, and the result reaches the resident instantly.',
  },
};
function t(key, vars) {
  let s = I18N[lang][key] ?? I18N.ar[key] ?? key;
  if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
  return s;
}
const L = (o) => (o && typeof o === 'object' ? o[lang] : o); // نص له نسختين عربي/إنجليزي

/* =========================================================
   المستخدمون والكتالوج
   ========================================================= */
// كلمة مرور موحّدة للحسابات التجريبية فقط (نموذج عرض، مو نظام حقيقي)
const DEMO_PASSWORD = 'demo123';

const USERS = {
  c3: { id: 'c3', username: 'faisal.malki', role: 'consultant', name: { ar: 'د. فيصل المالكي', en: 'Dr. Faisal Al-Malki' }, title: { ar: 'استشاري — Neurology', en: 'Consultant — Neurology' } },
  // kind: resident = طبيب مقيم · intern = طبيب امتياز (الاثنين في واجهة اليمين)
  r4: { id: 'r4', username: 'rayan.shahrani', role: 'resident', kind: 'resident', name: { ar: 'د. ريان الشهراني', en: 'Dr. Rayan Al-Shahrani' }, title: { ar: 'مقيم — Neurology R2', en: 'Resident — Neurology R2' }, supervisor: 'c3' },
  r5: { id: 'r5', username: 'asma.ghamdi', role: 'resident', kind: 'resident', name: { ar: 'د. أسماء الغامدي', en: 'Dr. Asma Al-Ghamdi' }, title: { ar: 'مقيمة — Neurology R4', en: 'Resident — Neurology R4' }, supervisor: 'c3' },
  i1: { id: 'i1', username: 'nouf.otaibi', role: 'resident', kind: 'intern', name: { ar: 'د. نوف العتيبي', en: 'Dr. Nouf Al-Otaibi' }, title: { ar: 'طبيبة امتياز — Neurology', en: 'Intern — Neurology' }, supervisor: 'c3' },
};

// أسماء الفحوصات والأدوية ثابتة بالإنجليزي — restricted = ممنوع على المقيم مباشرة
const CATALOG = [
  { id: 'CBC', type: 'lab', name: 'CBC — Complete Blood Count' },
  { id: 'BMP', type: 'lab', name: 'BMP — Basic Metabolic Panel' },
  { id: 'LFT', type: 'lab', name: 'LFT — Liver Function Test' },
  { id: 'CRP', type: 'lab', name: 'CRP — C-Reactive Protein' },
  { id: 'COAG', type: 'lab', name: 'PT / INR' },
  { id: 'BCX', type: 'lab', name: 'Blood Culture' },
  { id: 'CSF', type: 'lab', name: 'CSF Analysis' },
  { id: 'AED', type: 'lab', name: 'Anti-epileptic Drug Level' },

  { id: 'CXR', type: 'rad', name: 'Chest X-Ray' },
  { id: 'CT_NC', type: 'rad', name: 'CT without Contrast' },
  { id: 'CT_C', type: 'rad', name: 'CT with Contrast', restricted: true, reason: 'contrast' },
  { id: 'CTA', type: 'rad', name: 'CT Angiography — Head & Neck', restricted: true, reason: 'contrast' },
  { id: 'MRI', type: 'rad', name: 'MRI Brain', restricted: true, reason: 'cost' },
  { id: 'MRA', type: 'rad', name: 'MRA', restricted: true, reason: 'contrastCost' },
  { id: 'EEG', type: 'rad', name: 'EEG — Electroencephalogram' },
  { id: 'NCS', type: 'rad', name: 'NCS / EMG' },

  { id: 'PARA', type: 'med', name: 'Paracetamol 1g PO' },
  { id: 'OMEP', type: 'med', name: 'Omeprazole 40mg IV' },
  { id: 'CEFTR', type: 'med', name: 'Ceftriaxone 1g IV' },
  { id: 'ENOX', type: 'med', name: 'Enoxaparin 40mg SC' },
  { id: 'ASA', type: 'med', name: 'Aspirin 81mg PO' },
  { id: 'LEVET', type: 'med', name: 'Levetiracetam (Keppra) 500mg IV' },
  { id: 'LEVODOPA', type: 'med', name: 'Levodopa/Carbidopa 100/25mg PO' },
  { id: 'SUMA', type: 'med', name: 'Sumatriptan 50mg PO' },
  { id: 'TOPI', type: 'med', name: 'Topiramate 25mg PO' },
  { id: 'LABET', type: 'med', name: 'Labetalol 10mg IV' },
  { id: 'ATORVA', type: 'med', name: 'Atorvastatin 80mg PO' },
  { id: 'NS', type: 'med', name: 'Normal Saline 0.9% IV' },
  { id: 'TPA', type: 'med', name: 'Alteplase (tPA) 0.9mg/kg IV', restricted: true, reason: 'thrombolytic' },
  { id: 'IVIG', type: 'med', name: 'IVIG 0.4g/kg/day', restricted: true, reason: 'cost' },
  { id: 'MIDAZ', type: 'med', name: 'Midazolam 5mg IV', restricted: true, reason: 'controlled' },
  { id: 'LYRICA', type: 'med', name: 'Pregabalin (Lyrica) 75mg', restricted: true, reason: 'restricted' },
  { id: 'MORPH', type: 'med', name: 'Morphine 2mg IV', restricted: true, reason: 'controlled' },
  { id: 'FENT', type: 'med', name: 'Fentanyl 25mcg IV', restricted: true, reason: 'controlled' },
  { id: 'TRAM', type: 'med', name: 'Tramadol 50mg PO', restricted: true, reason: 'controlled' },
  { id: 'KCL', type: 'med', name: 'Potassium Chloride IV (concentrated)', restricted: true, reason: 'highAlert' },
];

const TYPE_ICON = { lab: 'LAB', rad: 'IMG', med: 'RX' }; // رموز نصية بسيطة بدل الإيموجي
const SETTING_SHORT = { in: 'In-pt', out: 'Out-pt', er: 'ER' };
const LEVEL_SHORT = { read: 'Read-only', write: 'Note-write' };
const URGENCY = {
  emergency: { icon: '', ms: HOUR, cls: 'em' },
  urgent: { icon: '', ms: 4 * HOUR, cls: 'ur' },
  routine: { icon: '', ms: 24 * HOUR, cls: 'ro' },
};
const ORDER_STATUS_CLS = { active: 'green', pending: 'amber', modified: 'amber', cancelled: 'red', rejected: 'red' };
const FEATURES = {
  resident: ['view', 'notes', 'orders', 'dup', 'noEdit', 'noRestricted', 'noContrast'],
  consultant: ['full', 'override', 'grant', 'er', 'approve', 'remote'],
};

/* خصائص الدخول من البيت (مثل Epic Haiku / Canto)
   الاستشاري نفسه يحدد من «الإعدادات» وش يحتاج منها. داخل المستشفى كل شي متاح. */
const HOME_GROUPS = [
  ['view', ['patients', 'results', 'resultAlerts', 'schedule']],
  ['comm', ['consults', 'inbasket']],
  ['sign', ['approvals', 'cosign']],
  ['write', ['edit', 'orders', 'eRx', 'media']],
];
const HOME_DEFAULTS = {
  patients: true, results: true, resultAlerts: true, schedule: true,
  consults: true, inbasket: true,
  approvals: true, cosign: true,
  edit: true, orders: false, eRx: false, media: false,
};
const homeSettings = { ...HOME_DEFAULTS };
// هل الخاصية متاحة؟ المقيم دائماً حسب صلاحياته، والاستشاري في المستشفى كل شي متاح
const can = (k, f) => k === 'res' || !panels.con.remote || homeSettings[f];

/* =========================================================
   البيانات التجريبية — النوتات الطبية مكتوبة بالإنجليزي (ثابتة)
   ========================================================= */
let seq = 100;
const uid = (p) => p + (++seq);

const db = {
  patients: [
    { id: 'p9', name: { ar: 'محمد عبدالله العمري', en: 'Mohammed Al-Omari' }, mrn: '102233', age: 66, sex: 'm', setting: 'er', loc: { ar: 'الطوارئ · Resus 1', en: 'ER · Resus 1' }, dx: 'Acute Ischemic Stroke — Code Stroke', allergies: [], consultantId: 'c3', vitals: 'BP 182/100 · HR 88 · NIHSS 9 · GCS 14' },
    { id: 'p10', name: { ar: 'لطيفة حمد الدوسري', en: 'Latifa Al-Dosari' }, mrn: '101977', age: 31, sex: 'f', setting: 'in', loc: { ar: 'Neurology 5A · سرير 4', en: 'Neurology 5A · Bed 4' }, dx: 'Status Epilepticus — Post-ictal', allergies: ['Carbamazepine'], consultantId: 'c3', vitals: 'BP 124/78 · HR 92 · GCS 13' },
    { id: 'p11', name: { ar: 'تركي سعود البقمي', en: 'Turki Al-Buqami' }, mrn: '100654', age: 42, sex: 'm', setting: 'in', loc: { ar: 'Neurology 5A · سرير 9', en: 'Neurology 5A · Bed 9' }, dx: 'Guillain-Barré Syndrome', allergies: [], consultantId: 'c3', vitals: 'FVC 22 ml/kg · HR 104 · Power 3/5 LL' },
    { id: 'p12', name: { ar: 'منيرة خالد العجمي', en: 'Munira Al-Ajmi' }, mrn: '095310', age: 38, sex: 'f', setting: 'out', loc: { ar: 'عيادة Neurology · 11:15', en: 'Neurology Clinic · 11:15' }, dx: 'Chronic Migraine — Follow-up', allergies: ['Codeine'], consultantId: 'c3', vitals: 'BP 118/76 · 12 attacks/month' },
    { id: 'p13', name: { ar: 'سعد مبارك الحارثي', en: 'Saad Al-Harthi' }, mrn: '087402', age: 70, sex: 'm', setting: 'out', loc: { ar: 'عيادة Neurology · 13:00', en: 'Neurology Clinic · 13:00' }, dx: 'Parkinson Disease — Follow-up', allergies: [], consultantId: 'c3', vitals: 'BP 132/80 · H&Y Stage 2' },
  ],

  // نتائج سابقة (لاكتشاف الفحوصات المكررة)
  labHistory: [
    { patientId: 'p9', item: 'CT_NC', time: NOW - 40 * MIN },
    { patientId: 'p10', item: 'EEG', time: NOW - DAY },
    { patientId: 'p10', item: 'BMP', time: NOW - 2 * DAY },
    { patientId: 'p11', item: 'NCS', time: NOW - 3 * DAY },
    { patientId: 'p11', item: 'CBC', time: NOW - 4 * DAY },
  ],

  // Allow Access: الاستشاري يمنح المقيم الدخول لمرضى تحت اسمه
  grants: [
    { residentId: 'r4', patientId: 'p9', level: 'write' },
    { residentId: 'r4', patientId: 'p10', level: 'write' },
    { residentId: 'r4', patientId: 'p12', level: 'read' },
    { residentId: 'r5', patientId: 'p11', level: 'write' },
    { residentId: 'r5', patientId: 'p13', level: 'write' },
    { residentId: 'r5', patientId: 'p10', level: 'read' },
    { residentId: 'i1', patientId: 'p10', level: 'read' },
    { residentId: 'i1', patientId: 'p13', level: 'write' },
  ],

  notes: [
    { id: 'n8', patientId: 'p9', authorId: 'r4', time: NOW - 35 * MIN, status: 'active', text: 'Code Stroke: LKW 08:30 (~2h ago). Right-sided weakness with expressive aphasia. NIHSS 9.\nNon-contrast CT: no hemorrhage. Candidate for IV tPA.' },
    { id: 'n9', patientId: 'p10', authorId: 'r4', time: NOW - 8 * HOUR, status: 'active', text: 'Recurrent seizures aborted with Lorazepam, then Levetiracetam loading. Currently post-ictal, GCS improving. EEG yesterday: no ongoing epileptiform activity.' },
    { id: 'n10', patientId: 'p11', authorId: 'r5', time: NOW - DAY, status: 'active', text: 'Ascending lower-limb weakness x5 days following GI infection. NCS: demyelinating pattern. FVC monitoring q4h.' },
    { id: 'n11', patientId: 'p12', authorId: 'c3', time: NOW - 60 * DAY, status: 'active', text: 'Chronic migraine. Start Topiramate 25mg with titration. Avoid analgesic overuse. F/U in 2 months with headache diary.' },
  ],

  orders: [
    { id: 'o7', patientId: 'p10', type: 'med', item: 'LEVET', details: 'q12h', authorId: 'r4', time: NOW - 8 * HOUR, status: 'active' },
    { id: 'o8', patientId: 'p9', type: 'med', item: 'TPA', details: '10% bolus, remainder over 60 min', authorId: 'r4', time: NOW - 15 * MIN, status: 'pending', requestReason: 'Within 4.5h window, CT negative for bleed, NIHSS 9, no contraindications.' },
    { id: 'o9', patientId: 'p11', type: 'med', item: 'IVIG', details: 'x5 days', authorId: 'r5', time: NOW - 3 * HOUR, status: 'pending', requestReason: 'GBS confirmed on NCS with progressive weakness.' },
    // علاجات نشطة لكل مريض
    { id: 'om1', patientId: 'p9', type: 'med', item: 'NS', details: '75 ml/h', authorId: 'r4', time: NOW - 50 * MIN, status: 'active' },
    { id: 'om2', patientId: 'p9', type: 'med', item: 'LABET', details: 'PRN if BP > 185/110', authorId: 'r4', time: NOW - 45 * MIN, status: 'active' },
    { id: 'om3', patientId: 'p11', type: 'med', item: 'ENOX', details: 'Once daily (DVT prophylaxis)', authorId: 'r5', time: NOW - DAY, status: 'active', cosignedBy: 'c3', cosignedAt: NOW - 20 * HOUR },
    { id: 'om4', patientId: 'p11', type: 'med', item: 'PARA', details: 'q6h PRN', authorId: 'r5', time: NOW - DAY, status: 'active', cosignedBy: 'c3', cosignedAt: NOW - 20 * HOUR },
    { id: 'om5', patientId: 'p12', type: 'med', item: 'TOPI', details: 'Nightly, titrate to 50mg', authorId: 'c3', time: NOW - 60 * DAY, status: 'active' },
    { id: 'om6', patientId: 'p10', type: 'med', item: 'OMEP', details: 'Once daily', authorId: 'r4', time: NOW - 8 * HOUR, status: 'active', cosignedBy: 'c3', cosignedAt: NOW - 6 * HOUR },
    // تحاليل وأشعة مربوطة بنتائجها
    { id: 'oR1', patientId: 'p9', type: 'rad', item: 'CT_NC', details: 'Code Stroke protocol', authorId: 'r4', time: NOW - 55 * MIN, status: 'active', resultId: 'rs1', cosignedBy: 'c3', cosignedAt: NOW - 40 * MIN },
    { id: 'oR2', patientId: 'p11', type: 'lab', item: 'CSF', details: 'Protein, cells, glucose', authorId: 'r5', time: NOW - 3 * HOUR, status: 'active', resultId: 'rs8' },
    { id: 'oR3', patientId: 'p10', type: 'lab', item: 'BMP', details: '', authorId: 'r4', time: NOW - 4 * HOUR, status: 'active', resultId: 'rs5', cosignedBy: 'c3', cosignedAt: NOW - 3 * HOUR },
    { id: 'oR4', patientId: 'p9', type: 'lab', item: 'LFT', details: 'Pre-thrombolysis baseline', authorId: 'r4', time: NOW - 10 * MIN, status: 'active' },
    { id: 'o10', patientId: 'p13', type: 'med', item: 'LEVODOPA', details: 'TID', authorId: 'r5', time: NOW - 2 * DAY, status: 'active', cosignedBy: 'c3', cosignedAt: NOW - 2 * DAY + 3 * HOUR },
  ],

  consults: [
    { id: 'cs6', patientId: 'p9', fromId: 'r4', toId: 'c3', urgency: 'emergency', time: NOW - 20 * MIN, status: 'open', replies: [], question: 'Code Stroke: NIHSS 9 within treatment window. Need urgent tPA decision. Should we proceed with CTA to rule out LVO for thrombectomy?' },
    { id: 'cs7', patientId: 'p11', fromId: 'r5', toId: 'c3', urgency: 'urgent', time: NOW - 2 * HOUR, status: 'open', replies: [], question: 'FVC dropped to 22 ml/kg. Should we transfer to ICU for monitoring?' },
  ],

  // النتائج (Results Review) — flag: H مرتفع · L منخفض · N طبيعي · abn غير طبيعي
  results: [
    { id: 'rs1', patientId: 'p9', type: 'rad', item: 'CT_NC', text: 'No intracranial hemorrhage. Subtle loss of grey-white differentiation, left MCA territory. ASPECTS 9.', flag: 'abn', time: NOW - 40 * MIN, reviewed: false },
    { id: 'rs2', patientId: 'p9', type: 'lab', name: 'Glucose', value: '7.8', unit: 'mmol/L', ref: '3.9–7.0', flag: 'H', time: NOW - 45 * MIN, reviewed: false },
    { id: 'rs3', patientId: 'p9', type: 'lab', name: 'INR', value: '1.0', unit: '', ref: '0.8–1.2', flag: 'N', time: NOW - 45 * MIN, reviewed: true },
    { id: 'rs4', patientId: 'p9', type: 'lab', name: 'Platelets', value: '245', unit: '×10⁹/L', ref: '150–400', flag: 'N', time: NOW - 45 * MIN, reviewed: true },
    { id: 'rs5', patientId: 'p10', type: 'lab', name: 'Sodium', value: '131', unit: 'mmol/L', ref: '135–145', flag: 'L', time: NOW - 3 * HOUR, reviewed: false },
    { id: 'rs6', patientId: 'p10', type: 'lab', name: 'Levetiracetam level', value: '18', unit: 'mg/L', ref: '12–46', flag: 'N', time: NOW - 5 * HOUR, reviewed: true },
    { id: 'rs7', patientId: 'p10', type: 'rad', item: 'EEG', text: 'Diffuse slowing. No ongoing epileptiform discharges.', flag: 'N', time: NOW - DAY, reviewed: true },
    { id: 'rs8', patientId: 'p11', type: 'lab', name: 'CSF protein', value: '1.2', unit: 'g/L', ref: '0.15–0.45', flag: 'H', time: NOW - 30 * MIN, reviewed: false },
    { id: 'rs9', patientId: 'p11', type: 'lab', name: 'WBC', value: '11.2', unit: '×10⁹/L', ref: '4–11', flag: 'H', time: NOW - 4 * DAY, reviewed: true },
    { id: 'rs10', patientId: 'p11', type: 'rad', item: 'NCS', text: 'Demyelinating polyneuropathy: prolonged distal latencies and conduction block.', flag: 'abn', time: NOW - 3 * DAY, reviewed: true },
  ],

  // صندوق الرسائل (In Basket) — يتعبّى تلقائياً من التنبيهات اللي توصل للاستشاري
  inbox: [],

  // جدول مواعيد العيادة (Schedule)
  schedule: [
    { consultantId: 'c3', time: '11:15', patientId: 'p12', reason: { ar: 'متابعة صداع نصفي', en: 'Migraine follow-up' } },
    { consultantId: 'c3', time: '13:00', patientId: 'p13', reason: { ar: 'متابعة باركنسون', en: 'Parkinson follow-up' } },
    { consultantId: 'c3', time: '14:30', name: { ar: 'هيفاء ناصر القحطاني', en: 'Haifa Al-Qahtani' }, mrn: '103118', reason: { ar: 'تحويل جديد: تنميل في اليدين', en: 'New referral: hand numbness' } },
  ],

  // الصور المرفقة (Media Capture)
  media: [],
};
db.consults.forEach((c) => { c.deadline = c.time + URGENCY[c.urgency].ms; });

/* حالة كل نصف من الشاشة — مستقلة تماماً */
const panels = {
  res: { role: 'resident', user: null, view: 'list', prevView: 'list', patientId: null, tab: 'notes', modal: null, editing: null, orderType: 'lab', filter: 'all' },
  con: { role: 'consultant', user: null, view: 'alerts', prevView: 'alerts', patientId: null, tab: 'notes', modal: null, editing: null, orderType: 'lab', filter: 'all', grantResident: null, alertFilter: null },
};

/* =========================================================
   أدوات مساعدة
   ========================================================= */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pat = (id) => db.patients.find((p) => p.id === id);
const item = (id) => CATALOG.find((c) => c.id === id);
const N = (x) => L(x.name);                 // اسم مستخدم أو مريض باللغة الحالية
const UN = (id) => N(USERS[id]);
const PN = (id) => N(pat(id));
const ini = (u) => N(u).replace(/^(د\.|Dr\.)\s*/, '').split(' ').filter(Boolean)
  .map((w) => w.replace(/^(ال|Al-)/, '')[0]).slice(0, 2).join(lang === 'ar' ? ' ' : '');
const avatar = (u, size = 'sm') => `<span class="avatar ${size} ${u.role}">${ini(u)}</span>`;
const fmtTime = (ts) => new Date(ts).toLocaleString(lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function ago(ts) {
  const d = Date.now() - ts;
  if (d < MIN) return t('time.now');
  if (d < HOUR) return t('time.min', { n: Math.floor(d / MIN) });
  if (d < DAY) return t('time.h', { n: Math.floor(d / HOUR) });
  return t('time.d', { n: Math.floor(d / DAY) });
}
function fmtLeft(ms) {
  let s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  const pad = (n) => String(n).padStart(2, '0');
  const tm = h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return ms < 0 ? t('timer.over', { t: tm }) : t('timer.left', { t: tm });
}
const timerCls = (ms) => (ms < 0 ? 't-over' : ms < 10 * MIN ? 't-red' : ms < 30 * MIN ? 't-amber' : 't-ok');
const timerEl = (deadline) => { const left = deadline - Date.now(); return `<span class="timer ${timerCls(left)}" data-deadline="${deadline}">${fmtLeft(left)}</span>`; };
const reasonOf = (c) => t('reason.' + c.reason);
const urgLabel = (u) => t('urg.' + u);

/* صلاحيات */
const grantOf = (resId, pid) => db.grants.find((g) => g.residentId === resId && g.patientId === pid);
const residentCanWrite = (resId, pid) => grantOf(resId, pid)?.level === 'write';
const isUnderName = (conId, pid) => pat(pid)?.consultantId === conId;
// الاستشاري يعدّل على أعماله وأعمال المقيمين التابعين له فقط
const consultantCanEdit = (conId, rec) => rec.authorId === conId || USERS[rec.authorId]?.supervisor === conId;

function recentSame(pid, itemId) {
  const cutoff = Date.now() - DUP_WINDOW;
  const hits = [
    ...db.labHistory.filter((h) => h.patientId === pid && h.item === itemId).map((h) => ({ time: h.time })),
    ...db.orders.filter((o) => o.patientId === pid && o.item === itemId && !['cancelled', 'rejected'].includes(o.status))
      .map((o) => ({ time: o.time, by: o.authorId })),
  ].filter((h) => h.time >= cutoff).sort((a, b) => b.time - a.time);
  return hits[0];
}

function touch(rec, by) { rec.flashUntil = Date.now() + 5000; rec.updatedBy = by; }
const flashCls = (k, rec) => (rec.flashUntil > Date.now() && rec.updatedBy !== panels[k].user ? ' flash' : '');

/* التنبيهات المنبثقة */
function toast(k, msg, kind = 'info') {
  const box = document.querySelector(`#panel-${k} .toasts`);
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = msg;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 5000);
  // على الجوال: نقطة تنبيه على زر الشاشة المخفية
  if (k !== shown) document.querySelector(`[data-show="${k}"] .ping`).hidden = false;
}

/* الجوال: أي شاشة ظاهرة (المقيم أو الاستشاري) */
let shown = 'res';
function applyShow() {
  document.body.dataset.show = shown;
  document.querySelectorAll('[data-show]').forEach((b) => {
    b.classList.toggle('on', b.dataset.show === shown);
    if (b.dataset.show === shown) b.querySelector('.ping').hidden = true;
  });
}
document.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => { shown = b.dataset.show; applyShow(); }));
applyShow();
function notify(userId, msg, kind) {
  for (const k in panels) if (panels[k].user === userId) toast(k, msg, kind);
  // كل تنبيه يوصل للاستشاري ينحفظ في صندوق الرسائل (In Basket)
  if (USERS[userId]?.role === 'consultant') db.inbox.unshift({ id: uid('ib'), to: userId, msg, time: Date.now(), read: false });
}
const notifyResidentsOf = (pid, msg, kind, except) =>
  db.grants.filter((g) => g.patientId === pid && g.residentId !== except).forEach((g) => notify(g.residentId, msg, kind));

/* أيقونات الصلاحيات — قابلة للضغط وتفتح شرح الخاصية */
const featureChips = (role) => FEATURES[role].map((f) =>
  `<button type="button" class="perm ${f.startsWith('no') ? 'no' : f === 'dup' ? 'warn' : 'yes'}" data-action="feature" data-f="${f}">${t('f.' + f)}</button>`).join('');

/* =========================================================
   الرسم (Render)
   ========================================================= */
// أي صفحات الاستشاري متاحة حالياً (من البيت تعتمد على الإعدادات)
function viewAllowed(k, v) {
  if (k !== 'con') return true;
  if (v === 'patients' || v === 'patient') return can(k, 'patients');
  if (v === 'schedule') return can(k, 'schedule');
  if (v === 'access') return !panels.con.remote;
  if (v === 'settings') return panels.con.remote; // الإعدادات تظهر في وضع البيت بس
  return true;
}

function view(k) {
  const P = panels[k];
  if (!P.user) return renderLogin(k) + renderModal(k);
  let body;
  // لو الخاصية انقفلت من الإعدادات وهو من البيت، يرجع للتنبيهات
  if (k === 'con' && !viewAllowed(k, P.view)) Object.assign(P, { view: 'alerts', patientId: null });
  if (P.view === 'patient') body = renderPatient(k);
  else if (k === 'res') body = renderResidentHome(k);
  else if (P.view === 'patients') body = renderConsultantPatients(k);
  else if (P.view === 'access') body = renderAccess(k);
  else if (P.view === 'schedule') body = renderSchedule(k);
  else if (P.view === 'settings') body = renderSettings(k);
  else body = renderAlerts(k);
  // وضع المنزل: شريط يوضح إن الخصائص حسب الإعدادات
  const banner = k === 'con' && P.remote ? `<div class="remote-banner"><span>${t('remote.banner')}</span>${P.view !== 'settings' ? `<button class="link" data-action="nav" data-v="settings">${t('remote.toSettings')}</button>` : ''}</div>` : '';
  return renderHeader(k) + `<div class="panel-body">${banner}${body}</div>` + renderModal(k);
}

function renderLogin(k) {
  const role = panels[k].role;
  const list = Object.values(USERS).filter((u) => u.role === role);
  const groups = role === 'resident' ? ['resident', 'intern'] : [null]; // مقيمين + امتياز
  const P = panels[k];
  // نموذج دخول عادي (اسم مستخدم + كلمة مرور) مع حسابات تجريبية تعبّي الحقول بضغطة
  return `<div class="panel-body" style="display:flex"><div class="login">
    <span class="login-badge">${t(role === 'resident' ? 'role.res' : 'role.con')}</span>
    <h2>${t('login.title')}</h2>
    <form class="login-form" data-form="login" autocomplete="off">
      <label for="lu-${k}">${t('login.user')}</label>
      <input id="lu-${k}" name="username" data-k="lu" dir="ltr" required>
      <label for="lp-${k}">${t('login.pass')}</label>
      <input id="lp-${k}" name="password" data-k="lp" type="password" dir="ltr" required>
      ${P.loginError ? `<div class="login-error">${t('login.err')}</div>` : ''}
      <button class="btn primary block">${t('login.btn')}</button>
    </form>
    <div class="demo"><small>${t('login.demo')}</small>
      ${groups.map((kind) => `${kind ? `<div class="acct-group">${t('grp.' + kind)}</div>` : ''}
      <div class="demo-list">${list.filter((u) => !kind || u.kind === kind).map((u) => `
        <button type="button" class="demo-chip" data-action="fill" data-id="${u.id}">${avatar(u, 'xs')}<span><b>${N(u)}</b><small class="ltr">${u.username}</small></span></button>`).join('')}</div>`).join('')}
    </div>
    <div class="login-rules"><small>${t('login.rules')}</small><div class="perms">${featureChips(role)}</div></div>
  </div></div>`;
}

function renderHeader(k) {
  const P = panels[k], u = USERS[P.user];
  let nav = '';
  if (k === 'con') {
    const open = db.consults.filter((c) => c.toId === u.id && c.status === 'open').length;
    const pend = db.orders.filter((o) => o.status === 'pending' && isUnderName(u.id, o.patientId)).length;
    const btn = (v, label, n) => `<button class="nav-btn${P.view === v || (P.view === 'patient' && P.prevView === v) ? ' on' : ''}" data-action="nav" data-v="${v}">${label}${n ? `<span class="count">${n}</span>` : ''}</button>`;
    nav = `<nav class="nav">${btn('alerts', t('nav.alerts'), open + pend)}${viewAllowed(k, 'patients') ? btn('patients', t('nav.patients'), 0) : ''}${viewAllowed(k, 'schedule') ? btn('schedule', t('nav.schedule'), 0) : ''}${viewAllowed(k, 'access') ? btn('access', t('nav.access'), 0) : ''}${viewAllowed(k, 'settings') ? btn('settings', t('nav.settings'), 0) : ''}</nav>`;
  }
  return `<header class="ph">
      <span class="ph-role">${k === 'res' ? t('hdr.' + u.kind) : t('hdr.con')}</span>
      <div class="ph-user">${avatar(u)}<div><b>${N(u)}</b><small>${L(u.title)}</small></div>
        ${k === 'con' ? `<button class="btn sm remote-btn${P.remote ? ' on' : ''}" data-action="remote" title="${t('remote.hint')}">${t(P.remote ? 'remote.home' : 'remote.hospital')}</button>` : ''}
        <button class="btn ghost sm" data-action="logout">${t('switch')}</button></div>
    </header>${nav}`;
}

function filterBar(k, patients) {
  const P = panels[k];
  const opts = [['all', t('filter.all')], ['in', t('set.in')], ['out', t('set.out')], ['er', t('set.er')]];
  return `<div class="filters">${opts.map(([v, l]) => {
    const n = v === 'all' ? patients.length : patients.filter((p) => p.setting === v).length;
    return `<button class="filter${P.filter === v ? ' on' : ''}" data-action="filter" data-v="${v}">${l} (${n})</button>`;
  }).join('')}</div>`;
}
const applyFilter = (k, list) => (panels[k].filter === 'all' ? list : list.filter((p) => p.setting === panels[k].filter));
const settingChip = (p) => `<span class="chip set-${p.setting}">${SETTING_SHORT[p.setting]}</span>`;
const levelChip = (level) => `<span class="chip ${level === 'write' ? 'green' : 'amber'}">${level === 'write' ? '✎' : ''} ${LEVEL_SHORT[level]}</span>`;

/* ---------- المقيم: الرئيسية ---------- */
function renderResidentHome(k) {
  const me = panels[k].user;
  const patients = db.grants.filter((g) => g.residentId === me).map((g) => pat(g.patientId));
  const shown = applyFilter(k, patients);
  const myConsults = db.consults.filter((c) => c.fromId === me).sort((a, b) => b.time - a.time);

  const cards = shown.map((p) => {
    const g = grantOf(me, p.id);
    const open = db.consults.filter((c) => c.patientId === p.id && c.status === 'open').length;
    const pend = db.orders.filter((o) => o.patientId === p.id && o.status === 'pending').length;
    return `<button class="pt-card" data-action="open-patient" data-id="${p.id}">
      <div class="row1"><span class="name">${N(p)}</span>${settingChip(p)}${levelChip(g.level)}</div>
      <div class="dx ltr">${esc(p.dx)}</div>
      <small>MRN ${p.mrn} · ${t('pt.years', { n: p.age })} · ${L(p.loc)} · ${t('pt.under', { c: UN(p.consultantId) })}</small>
      ${open || pend ? `<div class="tags">${open ? `<span class="chip red">${t('pt.openConsults', { n: open })}</span>` : ''}${pend ? `<span class="chip amber">${t('pt.pending', { n: pend })}</span>` : ''}</div>` : ''}
    </button>`;
  }).join('');

  return `
    <div class="section-title">${t('res.myPatients')}</div>
    ${filterBar(k, patients)}
    <div class="pt-grid">${cards || `<div class="empty">${patients.length ? t('res.noneInSection') : t('res.noGrants')}</div>`}</div>
    <div class="section-title">${t('res.myConsults')}</div>
    ${myConsults.map((c) => consultCard(k, c, true)).join('') || `<div class="empty">${t('empty.consults')}</div>`}`;
}

/* ---------- الاستشاري: المرضى ---------- */
function renderConsultantPatients(k) {
  const me = panels[k].user;
  const mine = db.patients.filter((p) => p.consultantId === me);
  const others = db.patients.filter((p) => p.consultantId !== me);
  const card = (p) => {
    const gs = db.grants.filter((g) => g.patientId === p.id);
    return `<button class="pt-card" data-action="open-patient" data-id="${p.id}">
      <div class="row1"><span class="name">${N(p)}</span>${settingChip(p)}${p.allergies.length ? `<span class="chip red">${t('con.allergyChip')}</span>` : ''}</div>
      <div class="dx ltr">${esc(p.dx)}</div>
      <small>MRN ${p.mrn} · ${t('pt.years', { n: p.age })} · ${L(p.loc)}</small>
      <div class="tags">${gs.map((g) => `<span class="chip ${g.level === 'write' ? 'green' : 'amber'}">${UN(g.residentId)} · ${LEVEL_SHORT[g.level]}</span>`).join('') || `<span class="chip">${t('con.noResidents')}</span>`}</div>
    </button>`;
  };
  return `
    <div class="section-title">${t('con.underName')}</div>
    ${filterBar(k, mine)}
    <div class="pt-grid">${applyFilter(k, mine).map(card).join('') || `<div class="empty">${t('res.noneInSection')}</div>`}</div>
    ${others.length ? `<div class="section-title">${t('con.others')}</div>
    <div class="pt-grid">${applyFilter(k, others).map(card).join('') || `<div class="empty">${t('empty.none')}</div>`}</div>` : ''}`;
}

/* ---------- الاستشاري: الطوارئ والتنبيهات ---------- */
function renderAlerts(k) {
  const P = panels[k], me = P.user, f = P.alertFilter;
  const cons = db.consults.filter((c) => c.toId === me);
  const open = cons.filter((c) => c.status === 'open').sort((a, b) => a.deadline - b.deadline);
  const done = cons.filter((c) => c.status !== 'open').sort((a, b) => b.time - a.time);
  const pending = db.orders.filter((o) => o.status === 'pending' && isUnderName(me, o.patientId));
  const justified = db.orders.filter((o) => o.justification && isUnderName(me, o.patientId)).sort((a, b) => b.time - a.time);
  const em = open.filter((c) => c.urgency === 'emergency');
  const overdue = open.filter((c) => c.deadline < Date.now());

  // مربعات الإحصائيات قابلة للضغط وتفلتر القائمة
  const stat = (id, n, cls) => `<button class="stat ${cls}${f === id ? ' on' : ''}" data-action="stat" data-f="${id}"><b>${n}</b><small>${t('stat.' + id)}</small></button>`;
  let list = '';
  if (f === 'em' || f === 'open' || f === 'overdue') {
    const arr = f === 'em' ? em : f === 'overdue' ? overdue : open;
    list = arr.map((c) => consultCard(k, c, true)).join('') || `<div class="empty">${t('alerts.noOpen')}</div>`;
  } else if (f === 'pending') {
    list = pending.map((o) => orderItem(k, o, true)).join('') || `<div class="empty">${t('alerts.noReq')}</div>`;
  } else {
    // نتائج جديدة، وأعمال تنتظر التوقيع، وصندوق الرسائل (كل وحدة حسب الإعدادات)
    const myPids = db.patients.filter((p) => p.consultantId === me).map((p) => p.id);
    const newResults = db.results.filter((r) => !r.reviewed && myPids.includes(r.patientId)).sort((a, b) => b.time - a.time);
    const toSign = [...db.notes.map((n) => ['note', n]), ...db.orders.map((o) => ['order', o])]
      .filter(([, r]) => needsCosign(r) && USERS[r.authorId].supervisor === me).sort((a, b) => b[1].time - a[1].time);
    const inbox = db.inbox.filter((m) => m.to === me);
    const unread = inbox.filter((m) => !m.read).length;
    const extra = `
      ${can(k, 'resultAlerts') ? `<div class="section-title">${t('alerts.newResults')} ${newResults.length ? `<span class="count">${newResults.length}</span>` : ''}</div>
      ${newResults.map((r) => `<div class="item mini${flashCls(k, r)}"><span class="type-ic ${r.type}">${TYPE_ICON[r.type]}</span>
        <div class="who"><b class="ltr">${esc(resultName(r))}${r.value ? ` · ${r.value} ${r.unit}` : ''}</b><small>${can(k, 'patients') ? `<button class="link" data-action="open-patient" data-id="${r.patientId}" data-tab="results">${PN(r.patientId)}</button>` : PN(r.patientId)} · ${ago(r.time)}</small></div>
        <span class="chip ${FLAG_CLS[r.flag]}">${t('flag.' + r.flag)}</span>
        <button class="btn sm ghost" data-action="review" data-id="${r.id}">${t('res.markReviewed')}</button></div>`).join('') || `<div class="empty">${t('alerts.noResults')}</div>`}` : ''}
      ${can(k, 'cosign') ? `<div class="section-title">${t('alerts.cosign')} ${toSign.length ? `<span class="count">${toSign.length}</span>` : ''}</div>
      ${toSign.map(([kind, r]) => `<div class="item mini${flashCls(k, r)}"><span class="type-ic ${kind === 'note' ? 'lab' : r.type}">${kind === 'note' ? 'NOTE' : TYPE_ICON[r.type]}</span>
        <div class="who"><b dir="auto">${kind === 'note' ? esc(r.text.slice(0, 70)) + (r.text.length > 70 ? '…' : '') : `<span class="ltr">${esc(item(r.item).name)}</span>`}</b><small>${PN(r.patientId)} · ${UN(r.authorId)} · ${ago(r.time)}</small></div>
        <button class="btn sm success" data-action="cosign" data-kind="${kind}" data-id="${r.id}">${t('cs.btn')}</button></div>`).join('') || `<div class="empty">${t('alerts.noCosign')}</div>`}` : ''}
      ${can(k, 'inbasket') ? `<div class="section-title">${t('alerts.inbox')} ${unread ? `<span class="count">${unread}</span>` : ''}<span class="spacer"></span>${unread ? `<button class="link" data-action="inbox-read">${t('alerts.markAll')}</button>` : ''}</div>
      <div class="card inbox">${inbox.slice(0, 8).map((m) => `<div class="inbox-row${m.read ? '' : ' unread'}"><span>${m.msg}</span><small>${ago(m.time)}</small></div>`).join('') || `<div class="empty">${t('alerts.inboxEmpty')}</div>`}</div>` : ''}`;
    list = `
      <div class="section-title">${t('alerts.consults')}</div>
      ${open.map((c) => consultCard(k, c, true)).join('') || `<div class="empty">${t('alerts.noOpen')}</div>`}
      <div class="section-title">${t('alerts.approvals')}</div>
      ${pending.map((o) => orderItem(k, o, true)).join('') || `<div class="empty">${t('alerts.noReq')}</div>`}
      ${justified.length ? `<div class="section-title">${t('alerts.justified')}</div>${justified.map((o) => orderItem(k, o, true)).join('')}` : ''}
      ${extra}
      ${done.length ? `<div class="section-title">${t('alerts.answered')}</div>${done.map((c) => consultCard(k, c, true)).join('')}` : ''}`;
  }
  return `
    <div class="stats">${stat('em', em.length, 'red')}${stat('open', open.length, '')}${stat('pending', pending.length, 'amber')}${stat('overdue', overdue.length, 'red')}</div>
    ${f ? `<div class="filter-banner"><span>${t('alerts.filtered', { f: t('stat.' + f) })}</span><button class="link" data-action="stat" data-f="${f}">${t('alerts.showAll')}</button></div>` : ''}
    ${list}`;
}

/* ---------- الاستشاري: منح الصلاحيات ---------- */
function renderAccess(k) {
  const P = panels[k], me = P.user;
  const residents = Object.values(USERS).filter((u) => u.role === 'resident' && u.supervisor === me);
  const sel = residents.some((r) => r.id === P.grantResident) ? P.grantResident : residents[0]?.id;
  const mine = db.patients.filter((p) => p.consultantId === me);
  if (!sel) return `<div class="empty">${t('access.noRes')}</div>`;
  return `
    <div class="card">
      <h3>${t('access.title')}</h3>
      <small>${t('access.sub')}</small>
      <div class="res-pick">${residents.map((r) => `
        <button class="pick${r.id === sel ? ' on' : ''}" data-action="pick-res" data-id="${r.id}">${avatar(r, 'xs')}<span>${N(r)}<small>${L(r.title)}</small></span></button>`).join('')}</div>
    </div>
    <div class="card">
      ${filterBar(k, mine)}
      ${applyFilter(k, mine).map((p) => {
        const g = grantOf(sel, p.id);
        return `<div class="grant-row">
          <div><b>${N(p)} ${settingChip(p)}</b><small class="ltr">${esc(p.dx)}</small> <small>· MRN ${p.mrn}</small></div>
          <label class="switch" title="${t('access.toggle')}"><input type="checkbox" data-change="grant" data-r="${sel}" data-p="${p.id}" ${g ? 'checked' : ''}><span></span></label>
          <select data-change="level" data-r="${sel}" data-p="${p.id}" ${g ? '' : 'disabled'}>
            ${['read', 'write'].map((v) => `<option value="${v}" ${g?.level === v ? 'selected' : ''}>${t('lvl.' + v)}</option>`).join('')}
          </select>
        </div>`;
      }).join('') || `<div class="empty">${t('res.noneInSection')}</div>`}
      <p class="muted" style="margin:10px 0 0;font-size:12px">${t('access.note')}</p>
    </div>`;
}

/* ---------- الاستشاري: الإعدادات (خصائص الدخول من البيت) ---------- */
function renderSettings(k) {
  const row = (f) => `<label class="set-row" for="hs-${f}">
      <span><b>${t('hf.' + f)}</b><small>${t('hd.' + f)}</small></span>
      <span class="switch"><input type="checkbox" id="hs-${f}" data-change="home" data-f="${f}" ${homeSettings[f] ? 'checked' : ''}><span></span></span>
    </label>`;
  const on = HOME_GROUPS.flatMap(([, fs]) => fs).filter((f) => homeSettings[f]).length;
  return `
    <div class="card">
      <h3>${t('set.title')}</h3>
      <small>${t('set.sub')}</small>
      <div class="set-actions">
        <span class="chip accent">${t('set.count', { n: on, total: HOME_GROUPS.flatMap(([, fs]) => fs).length })}</span>
        <span class="spacer"></span>
        <button class="btn sm ghost" data-action="set-preset" data-p="all">${t('set.all')}</button>
        <button class="btn sm ghost" data-action="set-preset" data-p="none">${t('set.none')}</button>
        <button class="btn sm ghost" data-action="set-preset" data-p="default">${t('set.default')}</button>
      </div>
    </div>
    ${HOME_GROUPS.map(([g, fs]) => `<div class="section-title">${t('set.g.' + g)}</div><div class="card set-list">${fs.map(row).join('')}</div>`).join('')}`;
}

/* ---------- الاستشاري: جدول المواعيد ---------- */
function renderSchedule(k) {
  const me = panels[k].user;
  const rows = db.schedule.filter((s) => s.consultantId === me).sort((a, b) => a.time.localeCompare(b.time));
  return `<div class="section-title">${t('sch.title')}</div>
    <div class="card sch-list">${rows.map((s) => {
      const p = s.patientId && pat(s.patientId);
      return `<div class="sch-row">
        <span class="sch-time ltr">${s.time}</span>
        <div class="sch-main"><b>${p ? N(p) : L(s.name)}</b><small>${L(s.reason)} · MRN ${p ? p.mrn : s.mrn}</small></div>
        ${p ? `<button class="btn sm ghost" data-action="open-patient" data-id="${p.id}">${t('sch.open')}</button>` : `<span class="chip">${t('sch.noFile')}</span>`}
      </div>`;
    }).join('') || `<div class="empty">${t('empty.none')}</div>`}</div>`;
}

/* ---------- النتائج والصور والتوقيع ---------- */
const resultName = (r) => r.name || item(r.item).name;
const FLAG_CLS = { H: 'red', L: 'amber', N: 'green', abn: 'red' };
function resultsTab(k, p) {
  const rs = db.results.filter((r) => r.patientId === p.id).sort((a, b) => b.time - a.time);
  if (!rs.length) return `<div class="empty">${t('res.none')}</div>`;
  const canReview = k === 'con';
  const labs = rs.filter((r) => r.type === 'lab'), imgs = rs.filter((r) => r.type === 'rad');
  return `${labs.length ? `<div class="section-title">${t('res.labs')}</div>
    <div class="card table-wrap"><table class="res-table"><thead><tr><th>${t('res.test')}</th><th>${t('res.value')}</th><th>${t('res.ref')}</th><th>${t('res.time')}</th><th></th></tr></thead><tbody>
    ${labs.map((r) => `<tr class="${r.flag !== 'N' ? 'abn' : ''}${flashCls(k, r)}">
      <td class="ltr">${esc(r.name)}${!r.reviewed ? ` <span class="chip accent">${t('res.new')}</span>` : ''}</td>
      <td class="ltr"><b>${r.value}</b> ${r.unit} <span class="chip ${FLAG_CLS[r.flag]}">${t('flag.' + r.flag)}</span></td>
      <td class="ltr">${r.ref}</td><td>${ago(r.time)}</td>
      <td>${canReview && !r.reviewed ? `<button class="btn sm ghost" data-action="review" data-id="${r.id}">${t('res.markReviewed')}</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>` : ''}
    ${imgs.length ? `<div class="section-title">${t('res.imaging')}</div>
    ${imgs.map((r) => `<article class="item${flashCls(k, r)}"><div class="item-top"><span class="type-ic rad">IMG</span>
      <div class="who"><b class="ltr">${esc(resultName(r))}</b><small>${ago(r.time)}</small></div>
      ${!r.reviewed ? `<span class="chip accent">${t('res.new')}</span>` : ''}<span class="chip ${FLAG_CLS[r.flag]}">${t('flag.' + r.flag)}</span></div>
      <p class="item-text ltr-block">${esc(r.text)}</p>
      ${canReview && !r.reviewed ? `<div class="item-foot"><button class="btn sm ghost" data-action="review" data-id="${r.id}">${t('res.markReviewed')}</button></div>` : ''}</article>`).join('')}` : ''}`;
}

function mediaTab(k, p, canUpload) {
  const ms = db.media.filter((m) => m.patientId === p.id).sort((a, b) => b.time - a.time);
  return `${canUpload ? `<form class="card form" data-form="media">
      <label for="mf-${k}">${t('media.add')}</label>
      <input type="file" id="mf-${k}" name="file" accept="image/*" required>
      <input name="caption" data-k="mcap-${p.id}" placeholder="${t('media.caption')}" dir="auto">
      <div class="form-foot"><button class="btn primary">${t('media.upload')}</button></div>
    </form>` : ''}
    <div class="media-grid">${ms.map((m) => `<figure class="media-item${flashCls(k, m)}"><img src="${m.src}" alt="${esc(m.caption)}"><figcaption>${m.caption ? `<b dir="auto">${esc(m.caption)}</b>` : ''}<small>${UN(m.by)} · ${ago(m.time)}${m.remote ? ` · ${t('remote.tag')}` : ''}</small></figcaption></figure>`).join('') || `<div class="empty">${t('media.empty')}</div>`}</div>`;
}

// التوقيع (Cosign): أعمال المقيم والامتياز تحتاج توقيع الاستشاري
const needsCosign = (rec) => USERS[rec.authorId]?.role === 'resident' && !rec.cosignedBy && !['voided', 'cancelled', 'rejected', 'pending'].includes(rec.status);
function cosignInfo(k, rec, kind) {
  if (USERS[rec.authorId]?.role !== 'resident') return '';
  if (rec.cosignedBy) return `<div class="note-box green">${t('cs.done', { u: UN(rec.cosignedBy), t: ago(rec.cosignedAt) })}${rec.cosignRemote ? ` · ${t('remote.tag')}` : ''}</div>`;
  if (!needsCosign(rec)) return '';
  const P = panels[k];
  const mine = k === 'con' && USERS[rec.authorId].supervisor === P.user && can(k, 'cosign');
  return `<div class="cosign-row"><span class="chip amber">${t('cs.wait')}</span>${mine ? `<button class="btn sm success" data-action="cosign" data-kind="${kind}" data-id="${rec.id}">${t('cs.btn')}</button>` : ''}</div>`;
}

/* ---------- ملف المريض (للطرفين) ---------- */
function renderPatient(k) {
  const P = panels[k], me = P.user, p = pat(P.patientId), isRes = k === 'res';
  const level = isRes ? grantOf(me, p.id)?.level : 'full';
  const canWrite = isRes ? level === 'write' : true;
  const canOrder = isRes ? canWrite : can(k, 'orders');
  const showResults = can(k, 'results');
  const notes = db.notes.filter((n) => n.patientId === p.id).sort((a, b) => b.time - a.time);
  const orders = db.orders.filter((o) => o.patientId === p.id).sort((a, b) => b.time - a.time);
  const results = db.results.filter((r) => r.patientId === p.id).sort((a, b) => b.time - a.time);
  const media = db.media.filter((m) => m.patientId === p.id);
  const medOrders = orders.filter((o) => o.type === 'med');
  // العلاجات الحالية تظهر للجميع، حتى صلاحية Read-only
  const activeMeds = medOrders.filter((o) => ['active', 'modified'].includes(o.status));
  const openCons = db.consults.filter((c) => c.patientId === p.id && c.status === 'open');
  if ((P.tab === 'results' && !showResults) || !['summary', 'notes', 'orders', 'results', 'meds', 'media'].includes(P.tab)) P.tab = 'summary';

  const blocked = `<div class="readonly-box">${isRes ? t('pt.readonly') : t('remote.blocked')}</div>`;
  let content = '';
  if (P.tab === 'summary') content = summaryTab(k, p, { activeMeds, results, orders, notes, showResults });
  else if (P.tab === 'results') content = resultsTab(k, p);
  else if (P.tab === 'meds') content = medsTab(k, medOrders);
  else if (P.tab === 'media') content = mediaTab(k, p, isRes ? canWrite : can(k, 'media'));
  else if (P.tab === 'notes') {
    // المقيم يكتب نوتات، والاستشاري يراجعها ويعدّل عليها
    const head = isRes
      ? (canWrite ? `<form class="card form" data-form="note">
          <label>${t('note.add')}</label>
          <textarea name="text" data-k="note-${p.id}" rows="3" required placeholder="${t('note.ph')}" dir="auto"></textarea>
          <div class="form-foot"><span class="hint">${t('note.lockHint')}</span><button class="btn primary">${t('note.save')}</button></div>
        </form>` : blocked)
      : (can(k, 'edit') ? `<div class="hint-box">${t('note.conHint')}</div>` : blocked);
    content = head + (notes.map((n) => noteItem(k, n)).join('') || `<div class="empty">${t('empty.notes')}</div>`);
  } else {
    content = (canOrder ? orderForm(k, p) : blocked) + (orders.map((o) => orderItem(k, o)).join('') || `<div class="empty">${t('empty.orders')}</div>`);
  }

  const tab = (id, n) => `<button class="tab${P.tab === id ? ' on' : ''}" data-action="tab" data-t="${id}">${t('tab.' + id)}${n != null ? ` <span class="count soft">${n}</span>` : ''}</button>`;
  const consultBtn = isRes && canWrite ? `<button class="btn sm ghost" data-action="consult-open">${t('consult.btn')}</button>` : '';
  const consChip = openCons.length ? (k === 'con'
    ? `<button class="chip red chip-btn" data-action="nav" data-v="alerts">${t('consult.openChip', { n: openCons.length })}</button>`
    : `<span class="chip red">${t('consult.openChip', { n: openCons.length })}</span>`) : '';

  return `
    <button class="back" data-action="back">${t('pt.back')}</button>
    <div class="chart-banner">
      <div class="cb-top">
        <span class="name">${N(p)}</span>${settingChip(p)}
        ${isRes ? levelChip(level) : `<span class="chip accent">${isUnderName(me, p.id) ? t('pt.underYou') : t('pt.fullAccess')}</span>`}
        <span class="spacer"></span>${consChip}${consultBtn}
      </div>
      <div class="cb-grid">
        <div><small>MRN</small><b class="ltr">${p.mrn}</b></div>
        <div><small>${t('pt.ageSex')}</small><b>${t('pt.years', { n: p.age })} · ${t('sex.' + p.sex)}</b></div>
        <div><small>${t('pt.location')}</small><b>${L(p.loc)}</b></div>
        <div><small>${t('pt.consultant')}</small><b>${UN(p.consultantId)}</b></div>
      </div>
      <div class="cb-allergy">${p.allergies.length ? p.allergies.map((a) => `<span class="chip red">${t('pt.allergy', { a })}</span>`).join('') : `<span class="chip green">${t('pt.noAllergy')}</span>`}
        ${!isRes ? db.grants.filter((g) => g.patientId === p.id).map((g) => `<span class="chip">${UN(g.residentId)} · ${LEVEL_SHORT[g.level]}</span>`).join('') : ''}</div>
    </div>
    <div class="tabs">${tab('summary')}${tab('notes', notes.length)}${tab('orders', orders.length)}${showResults ? tab('results', results.length) : ''}${tab('meds', activeMeds.length)}${tab('media', media.length)}</div>
    ${content}`;
}

/* ملخص الملف: أول شي يشوفه الطبيب */
function summaryTab(k, p, { activeMeds, results, orders, notes, showResults }) {
  const awaiting = orders.filter((o) => o.type !== 'med' && ['active', 'modified'].includes(o.status) && !o.resultId);
  const box = (title, body) => `<section class="card sum"><h4>${title}</h4>${body}</section>`;
  const none = `<small class="muted">${t('sum.none')}</small>`;
  const last = notes.find((n) => n.status !== 'voided');
  return `<div class="sum-grid">
    ${box(t('sum.dx'), `<b class="ltr">${esc(p.dx)}</b>`)}
    ${box(t('sum.vitals'), `<div class="ltr">${p.vitals}</div>`)}
    ${box(t('sum.meds'), activeMeds.length ? `<ul class="sum-list">${activeMeds.map((o) => `<li class="ltr"><b>${esc(item(o.item).name)}</b>${o.details ? ` · ${esc(o.details)}` : ''}</li>`).join('')}</ul>` : none)}
    ${showResults ? box(t('sum.results'), results.length ? `<ul class="sum-list">${results.slice(0, 4).map((r) => `<li><span class="ltr">${esc(resultName(r))}${r.value ? ` <b>${r.value}</b> ${r.unit}` : ''}</span> <span class="chip ${FLAG_CLS[r.flag]}">${t('flag.' + r.flag)}</span></li>`).join('')}</ul>
      <button class="link" data-action="tab" data-t="results">${t('sum.allResults')}</button>` : none) : ''}
    ${box(t('sum.pending'), awaiting.length ? `<ul class="sum-list">${awaiting.map((o) => `<li><span class="ltr">${esc(item(o.item).name)}</span> <span class="chip amber">${t('ord.awaiting')}</span></li>`).join('')}</ul>` : none)}
    ${box(t('sum.lastNote'), last ? `<p class="item-text clamp" dir="auto">${esc(last.text)}</p><small>${UN(last.authorId)} · ${ago(last.time)}</small>` : none)}
  </div>`;
}

/* الأدوية: مثل سجل الأدوية في الأنظمة (MAR) */
function medsTab(k, medOrders) {
  if (!medOrders.length) return `<div class="empty">${t('pt.noMeds')}</div>`;
  return `<div class="card table-wrap"><table class="res-table"><thead><tr>
      <th>${t('meds.med')}</th><th>${t('meds.dose')}</th><th>${t('meds.by')}</th><th>${t('meds.since')}</th><th>${t('meds.status')}</th></tr></thead><tbody>
    ${medOrders.map((o) => `<tr class="${['cancelled', 'rejected'].includes(o.status) ? 'muted-row' : ''}">
      <td class="ltr"><b>${esc(item(o.item).name)}</b></td><td class="ltr">${esc(o.details || '—')}</td>
      <td>${UN(o.authorId)}</td><td>${ago(o.time)}</td><td><span class="chip ${ORDER_STATUS_CLS[o.status]}">${t('st.' + o.status)}</span></td></tr>`).join('')}
    </tbody></table></div>`;
}

function noteItem(k, n) {
  const P = panels[k], a = USERS[n.authorId], isRes = k === 'res';
  const voided = n.status === 'voided';
  const editing = !isRes && P.editing?.id === n.id;
  const canEdit = !isRes && !voided && can(k, 'edit') && consultantCanEdit(P.user, n);
  let actions = '';
  if (isRes) actions = `<span class="lock" title="${t('lock.res')}">${t('lock.short')}</span>`;
  else if (canEdit && !editing) actions = `<button class="btn sm ghost" data-action="edit" data-id="${n.id}">${t('btn.edit')}</button><button class="btn sm danger-ghost" data-action="void" data-kind="note" data-id="${n.id}">${t('btn.void')}</button>`;
  else if (!canEdit && !voided) actions = `<span class="lock" title="${t('lock.notYours')}">${t('lock.short')}</span>`;

  return `<article class="item${n.edited ? ' is-edited' : ''}${voided ? ' is-void' : ''}${flashCls(k, n)}">
    <div class="item-top">${avatar(a, 'xs')}<div class="who"><b>${N(a)}</b><small>${L(a.title)} · ${fmtTime(n.time)}</small></div><div class="item-actions">${actions}</div></div>
    ${editing ? `<div class="edit-box"><textarea data-k="edit-${n.id}" rows="4" dir="auto">${esc(n.text)}</textarea>
        <div class="form-foot"><button class="btn sm ghost" data-action="edit-cancel">${t('btn.undo')}</button><button class="btn sm primary" data-action="save-note" data-id="${n.id}">${t('btn.saveEdit')}</button></div></div>`
      : `<p class="item-text" dir="auto">${esc(n.text)}</p>`}
    ${n.edited ? `<div class="edit-tag">${t('note.edited', { u: UN(n.edited.by), t: ago(n.edited.time) })}<details><summary>${t('note.original')}</summary><p dir="auto">${esc(n.edited.original)}</p></details></div>` : ''}
    ${voided ? `<div class="void-tag">${t('note.voided', { u: UN(n.voided.by) })}${n.voided.reason ? ' — ' + esc(n.voided.reason) : ''}</div>` : ''}
    ${cosignInfo(k, n, 'note')}
  </article>`;
}

function orderForm(k, p) {
  const P = panels[k], isRes = k === 'res', type = P.orderType;
  // الوصفة الإلكترونية: للاستشاري، دواء، ومريض عيادات
  const erx = !isRes && type === 'med' && p.setting === 'out' && can(k, 'eRx');
  const items = CATALOG.filter((c) => c.type === type);
  return `<form class="card form" data-form="order">
    <label>${t('order.new')} ${isRes ? t('order.initial') : ''}</label>
    <div class="seg">${['lab', 'rad', 'med'].map((x) => `<button type="button" class="seg-btn${x === type ? ' on' : ''}" data-action="otype" data-t="${x}">${t('type.' + x)}</button>`).join('')}</div>
    <div class="row"><select name="item" data-k="oitem-${type}">${items.map((c) => `<option value="${c.id}">${c.restricted ? (isRes ? '' : '') : ''}${c.name}${c.restricted ? ' — ' + reasonOf(c) : ''}</option>`).join('')}</select></div>
    <input name="details" data-k="odet" placeholder="${t('order.detailsPh')}" dir="auto">
    ${erx ? `<label class="check"><input type="checkbox" name="erx" id="erx-${k}"> ${t('erx.label')}</label>` : ''}
    <div class="form-foot">${isRes ? `<span class="hint">${t('order.hint')}</span>` : ''}<button class="btn primary">${t('order.send')}</button></div>
  </form>`;
}

function orderItem(k, o, showPatient = false) {
  const P = panels[k], c = item(o.item), a = USERS[o.authorId], isRes = k === 'res';
  const closed = ['cancelled', 'rejected'].includes(o.status);
  const editing = !isRes && P.editing?.id === o.id;
  const canApprove = !isRes && o.status === 'pending' && isUnderName(P.user, o.patientId) && can(k, 'approvals');
  const canEdit = !isRes && !closed && can(k, 'edit') && o.status !== 'pending' && consultantCanEdit(P.user, o);
  let foot = '';
  if (isRes) foot = `<span class="lock">${t('order.lockFoot')}</span>`;
  else if (canApprove) foot = `<button class="btn sm danger-ghost" data-action="reject" data-id="${o.id}">${t('btn.reject')}</button><button class="btn sm success" data-action="approve" data-id="${o.id}">${t('btn.approve')}</button>`;
  else if (canEdit && !editing) foot = `<button class="btn sm ghost" data-action="edit" data-id="${o.id}">${t('btn.edit')}</button><button class="btn sm danger-ghost" data-action="void" data-kind="order" data-id="${o.id}">${t('btn.cancelOrder')}</button>`;

  return `<article class="item order${o.modified ? ' is-edited' : ''}${closed ? ' is-void' : ''}${flashCls(k, o)}">
    <div class="item-top"><span class="type-ic ${o.type}">${TYPE_ICON[o.type]}</span>
      <div class="who"><b class="ltr">${esc(c.name)}</b><small>${showPatient ? `<button class="link" data-action="open-patient" data-id="${o.patientId}" data-tab="orders">${PN(o.patientId)}</button> · ` : ''}${t('type.' + o.type)} · ${N(a)} · ${fmtTime(o.time)}</small></div>
      ${o.erx ? `<span class="chip accent">${t('erx.chip')}</span>` : ''}<span class="chip ${ORDER_STATUS_CLS[o.status]}">${t('st.' + o.status)}</span></div>
    ${editing ? `<div class="edit-box">
        <select data-k="eitem-${o.id}">${CATALOG.filter((x) => x.type === o.type).map((x) => `<option value="${x.id}" ${x.id === o.item ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
        <input data-k="edet-${o.id}" value="${esc(o.details)}" placeholder="${t('order.detailsPh')}" dir="auto">
        <div class="form-foot"><button class="btn sm ghost" data-action="edit-cancel">${t('btn.undo')}</button><button class="btn sm primary" data-action="save-order" data-id="${o.id}">${t('btn.saveEdit')}</button></div></div>`
      : o.details ? `<p class="item-text" dir="auto">${esc(o.details)}</p>` : ''}
    ${o.justification ? `<div class="note-box amber"><b>${t('order.justification')}</b> <span dir="auto">${esc(o.justification)}</span></div>` : ''}
    ${o.requestReason ? `<div class="note-box"><b>${t('order.reqReason')}</b> <span dir="auto">${esc(o.requestReason)}</span></div>` : ''}
    ${o.approvedBy ? `<div class="note-box green">${t('order.approved', { u: UN(o.approvedBy), t: ago(o.approvedAt) })}${o.approvedRemote ? ` · ${t('remote.tag')}` : ''}</div>` : ''}
    ${o.modified ? `<div class="edit-tag">${t('order.modified', { u: UN(o.modified.by), t: ago(o.modified.time) })}<br>${t('order.was')} <span class="ltr">${esc(o.modified.original)}</span></div>` : ''}
    ${o.cancelled ? `<div class="void-tag">${t(o.status === 'rejected' ? 'order.rejectedBy' : 'order.cancelledBy', { u: UN(o.cancelled.by) })}${o.cancelled.reason ? ' — ' + esc(o.cancelled.reason) : ''}</div>` : ''}
    ${orderResult(k, o)}
    ${cosignInfo(k, o, 'order')}
    <div class="item-foot">${foot}</div>
  </article>`;
}

// نتيجة الطلب تظهر تحته مباشرة: بانتظار النتيجة، أو القيمة، أو تقرير الأشعة
function orderResult(k, o) {
  if (o.type === 'med' || !['active', 'modified'].includes(o.status)) return '';
  const r = o.resultId && db.results.find((x) => x.id === o.resultId);
  if (!r) return `<div class="order-result wait"><span class="chip amber">${t('ord.awaiting')}</span></div>`;
  const body = r.type === 'lab'
    ? `<span class="ltr">${esc(r.name)}: <b>${r.value}</b> ${r.unit}</span> <small class="ltr">(${t('res.ref')} ${r.ref})</small>`
    : `<span class="ltr-block">${esc(r.text)}</span>`;
  return `<div class="order-result${r.flag !== 'N' ? ' abn' : ''}${flashCls(k, r)}"><b>${t(r.type === 'lab' ? 'ord.result' : 'ord.report')}</b> ${body} <span class="chip ${FLAG_CLS[r.flag]}">${t('flag.' + r.flag)}</span></div>`;
}

/* محاكاة صدور النتائج: أي تحليل أو أشعة تطلع نتيجته بعد ثواني (للعرض) */
const RESULT_DELAY = 15 * 1000;
const SIM_RESULTS = {
  CBC: { name: 'WBC', value: '7.2', unit: '×10⁹/L', ref: '4–11' },
  BMP: { name: 'Sodium', value: '138', unit: 'mmol/L', ref: '135–145' },
  LFT: { name: 'ALT', value: '28', unit: 'U/L', ref: '7–56' },
  CRP: { name: 'CRP', value: '4', unit: 'mg/L', ref: '< 5' },
  COAG: { name: 'INR', value: '1.1', unit: '', ref: '0.8–1.2' },
  BCX: { name: 'Blood culture', value: 'No growth (24h)', unit: '', ref: 'No growth' },
  CSF: { name: 'CSF protein', value: '0.38', unit: 'g/L', ref: '0.15–0.45' },
  AED: { name: 'Anti-epileptic drug level', value: '22', unit: 'mg/L', ref: '12–46' },
  CXR: { text: 'No acute cardiopulmonary findings.' },
  CT_NC: { text: 'No acute intracranial hemorrhage or mass effect.' },
  CT_C: { text: 'No abnormal enhancement.' },
  CTA: { text: 'No large vessel occlusion. Intracranial vessels patent.' },
  MRI: { text: 'Small acute infarct on DWI, left corona radiata.', flag: 'abn' },
  MRA: { text: 'No significant stenosis.' },
  EEG: { text: 'Normal background. No epileptiform discharges.' },
  NCS: { text: 'Within normal limits.' },
};
function scheduleResult(o) {
  if (o.type === 'med' || o.resultId) return;
  setTimeout(() => {
    if (!['active', 'modified'].includes(o.status) || o.resultId) return;
    const sim = SIM_RESULTS[o.item] || { text: 'Report available.' };
    const r = { id: uid('rs'), patientId: o.patientId, type: o.type, item: o.item, time: Date.now(), reviewed: false, ...sim, flag: sim.flag || 'N' };
    touch(r, 'system');
    db.results.push(r);
    o.resultId = r.id;
    touch(o, 'system');
    const msg = t('toast.resultReady', { i: item(o.item).name, p: PN(o.patientId) });
    notify(o.authorId, msg, 'ok');
    const con = pat(o.patientId).consultantId;
    if (con !== o.authorId) notify(con, msg, 'ok');
    update();
  }, RESULT_DELAY);
}

function consultCard(k, c, showPatient) {
  const P = panels[k], p = pat(c.patientId), u = URGENCY[c.urgency];
  const canOpen = k === 'con' || grantOf(P.user, p.id);
  const isTarget = k === 'con' && c.toId === P.user && can(k, 'consults');
  return `<article class="item consult ${c.status === 'open' ? 'open' : ''} ${u.cls}${flashCls(k, c)}">
    <div class="item-top"><span class="chip ${u.cls}">${urgLabel(c.urgency)}</span>
      ${showPatient ? (canOpen ? `<button class="link" data-action="open-patient" data-id="${p.id}" data-tab="summary">${N(p)}</button>` : `<b>${N(p)}</b>`) + settingChip(p) : ''}
      <span class="spacer"></span>
      ${c.status === 'open' ? timerEl(c.deadline) : `<span class="chip green">${t('consult.answeredIn', { n: Math.max(1, Math.round((c.answeredAt - c.time) / MIN)) })}</span>`}
    </div>
    <div class="meta">${t('consult.fromTo', { a: UN(c.fromId), b: UN(c.toId), t: ago(c.time) })}</div>
    <p class="item-text" dir="auto">${esc(c.question)}</p>
    ${c.replies.map((r) => `<div class="reply"><b>${UN(r.by)}</b> <small>${ago(r.time)}${r.remote ? ` · ${t('remote.tag')}` : ''}</small><p dir="auto">${esc(r.text)}</p></div>`).join('')}
    ${isTarget ? `<form class="reply-form" data-form="reply" data-id="${c.id}">
        <div class="quick">${t('quick').map((q) => `<button type="button" data-action="quick" data-id="${c.id}" data-text="${esc(q)}">${q}</button>`).join('')}</div>
        <textarea name="text" data-k="reply-${c.id}" rows="2" required placeholder="${t('consult.replyPh')}" dir="auto"></textarea>
        <div class="form-foot"><button class="btn primary sm">${t('consult.sendReply')}</button></div>
      </form>` : ''}
  </article>`;
}

function renderModal(k) {
  const P = panels[k], m = P.modal;
  if (!m) return '';
  let inner = '';
  if (m.type === 'feature') {
    inner = `<h3>${t('f.' + m.f).replace(/^[✓✗]\s*/, '')}</h3>
      <p>${t('i.' + m.f)}</p>
      <div class="form-foot"><button type="button" class="btn primary" data-action="close-modal">${t('modal.gotIt')}</button></div>`;
  } else if (m.type === 'consult') {
    const p = pat(P.patientId);
    inner = `<h3>${t('consult.req', { c: UN(p.consultantId) })}</h3>
      <form data-form="consult">
        <div class="urg-pick">${Object.entries(URGENCY).map(([v, u], i) => `<label><input type="radio" name="urgency" value="${v}" ${i === 0 ? 'checked' : ''}> ${urgLabel(v)} <small>(${t('consult.h', { n: u.ms / HOUR })})</small></label>`).join('')}</div>
        <textarea name="question" data-k="cq-${p.id}" rows="4" required placeholder="${t('consult.ph')}" dir="auto"></textarea>
        <div class="form-foot"><button type="button" class="btn ghost" data-action="close-modal">${t('modal.close')}</button><button class="btn primary">${t('consult.send')}</button></div>
      </form>`;
  } else if (m.type === 'dup') {
    const c = item(m.draft.item);
    const src = m.hit.by ? t('src.order', { u: UN(m.hit.by) }) : t('src.result');
    inner = `<h3>${t('modal.dupTitle')}</h3>
      <p>${t('modal.dupBody', { i: esc(c.name), ago: ago(m.hit.time), time: fmtTime(m.hit.time), src })}</p>
      <p class="muted">${t('modal.dupHint')}</p>
      <form data-form="justify">
        <textarea name="j" data-k="m-j" rows="3" required minlength="8" placeholder="${t('modal.dupPh')}" dir="auto"></textarea>
        <div class="form-foot"><button type="button" class="btn ghost" data-action="close-modal">${t('modal.cancelReq')}</button><button class="btn warn">${t('modal.sendJust')}</button></div>
      </form>`;
  } else if (m.type === 'restricted') {
    const c = item(m.draft.item), p = pat(m.draft.patientId);
    inner = `<h3>${t('modal.rTitle')}</h3>
      <p>${t('modal.rClass', { i: esc(c.name), c: `<span class="chip red">${reasonOf(c)}</span>` })}</p>
      <p class="muted">${t('modal.rBody', { c: UN(p.consultantId) })}</p>
      <form data-form="approval">
        <textarea name="reason" data-k="m-r" rows="3" required minlength="8" placeholder="${t('modal.rPh')}" dir="auto"></textarea>
        <div class="form-foot"><button type="button" class="btn ghost" data-action="close-modal">${t('modal.close')}</button><button class="btn primary">${t('modal.sendApproval')}</button></div>
      </form>`;
  } else if (m.type === 'cancel' || m.type === 'reject') {
    const title = m.type === 'reject' ? t('modal.reject') : m.kind === 'note' ? t('modal.voidNote') : t('modal.cancelOrder');
    inner = `<h3>${title}</h3>
      <p class="muted">${t('modal.reasonVisible')}</p>
      <form data-form="${m.type}">
        <textarea name="reason" data-k="m-c" rows="2" placeholder="${t('modal.reasonPh')}" dir="auto"></textarea>
        <div class="form-foot"><button type="button" class="btn ghost" data-action="close-modal">${t('modal.back')}</button><button class="btn danger">${t('modal.confirm')}</button></div>
      </form>`;
  }
  return `<div class="modal-wrap" data-action="backdrop"><div class="modal">${inner}</div></div>`;
}

/* إعادة الرسم مع الحفاظ على ما يكتبه المستخدم في الطرف الآخر */
const lastViewKey = {};
function render(k) {
  const root = document.querySelector(`#panel-${k} .panel-root`);
  const saved = {};
  root.querySelectorAll('[data-k]').forEach((el) => { saved[el.dataset.k] = el.value; });
  const active = document.activeElement;
  const focusK = root.contains(active) ? active.dataset.k : null;
  let selS = null, selE = null;
  try { selS = active.selectionStart; selE = active.selectionEnd; } catch (e) { /* select */ }
  const body = root.querySelector('.panel-body');
  const scroll = body ? body.scrollTop : 0;
  const P = panels[k];
  const key = [P.user, P.view, P.patientId, P.tab].join('|');

  root.innerHTML = view(k);

  root.querySelectorAll('[data-k]').forEach((el) => {
    const v = saved[el.dataset.k];
    if (v === undefined) return;
    if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) return;
    el.value = v;
  });
  const nb = root.querySelector('.panel-body');
  if (nb && lastViewKey[k] === key) nb.scrollTop = scroll;
  lastViewKey[k] = key;
  if (focusK) {
    const f = root.querySelector(`[data-k="${focusK}"]`);
    if (f) { f.focus({ preventScroll: true }); try { if (selS != null) f.setSelectionRange(selS, selE); } catch (e) { /* select */ } }
  }
}
function update() { render('res'); render('con'); }

/* اللغة والاتجاه + نصوص الشريط العلوي */
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach((el) => el.classList.toggle('on', el.dataset.lang === lang));
  update();
}
document.querySelectorAll('[data-lang]').forEach((el) => el.addEventListener('click', () => {
  lang = el.dataset.lang;
  try { localStorage.setItem('nb-lang', lang); } catch (e) { /* storage blocked */ }
  applyLang();
}));

/* =========================================================
   الإجراءات
   ========================================================= */
const val = (k, key) => (document.querySelector(`#panel-${k} [data-k="${key}"]`)?.value || '').trim();

function addNote(k, text) {
  const P = panels[k], p = pat(P.patientId), me = P.user;
  if (k === 'res' && !residentCanWrite(me, p.id)) return toast(k, t('toast.readonly'), 'danger');
  const n = { id: uid('n'), patientId: p.id, authorId: me, time: Date.now(), status: 'active', text };
  touch(n, me);
  db.notes.push(n);
  if (k === 'res') {
    toast(k, t('toast.noteSavedRes'), 'ok');
    notify(p.consultantId, t('toast.noteNew', { u: UN(me), p: N(p) }));
  } else {
    toast(k, t('toast.noteSaved'), 'ok');
    notifyResidentsOf(p.id, t('toast.noteNewCon', { u: UN(me), p: N(p) }));
  }
}

function placeOrder(k, itemId, details, erx = false) {
  const P = panels[k], c = item(itemId), pid = P.patientId;
  if (k === 'res' && !residentCanWrite(P.user, pid)) return toast(k, t('toast.readonly'), 'danger');
  const draft = { patientId: pid, type: c.type, item: itemId, details, ...(erx ? { erx: true } : {}) };
  if (k === 'res') {
    if (c.restricted) { P.modal = { type: 'restricted', draft }; return; }
    if (c.type !== 'med') {
      const hit = recentSame(pid, itemId);
      if (hit) { P.modal = { type: 'dup', draft, hit }; return; }
    }
  }
  createOrder(k, draft);
}

function createOrder(k, draft, extra = {}) {
  const P = panels[k], me = P.user, p = pat(draft.patientId), c = item(draft.item);
  const o = { id: uid('o'), ...draft, authorId: me, time: Date.now(), status: 'active', ...extra };
  touch(o, me);
  db.orders.push(o);
  if (o.status === 'active') scheduleResult(o);
  const v = { i: c.name, p: N(p), u: UN(me), c: UN(p.consultantId) };
  if (k === 'res') {
    if (o.status === 'pending') {
      toast(k, t('toast.pendingSent', v), 'warn');
      notify(p.consultantId, t('toast.pendingNew', v), 'warn');
    } else if (o.justification) {
      toast(k, t('toast.justSent'), 'ok');
      notify(p.consultantId, t('toast.justNew', v), 'warn');
    } else {
      toast(k, t('toast.orderSent', v), 'ok');
      notify(p.consultantId, t('toast.orderNew', v));
    }
  } else {
    toast(k, t('toast.orderSent', v), 'ok');
    notifyResidentsOf(p.id, t('toast.orderNewCon', v));
  }
}

function sendReply(k, cid, text) {
  const c = db.consults.find((x) => x.id === cid), me = panels[k].user, p = pat(c.patientId);
  c.replies.push({ by: me, time: Date.now(), text, remote: !!panels[k].remote });
  if (c.status === 'open') { c.status = 'answered'; c.answeredAt = Date.now(); }
  touch(c, me);
  toast(k, t('toast.replySent'), 'ok');
  notify(c.fromId, t('toast.replyNew', { u: UN(me), p: N(p) }), 'ok');
  notifyResidentsOf(p.id, t('toast.replyTeam', { p: N(p) }), 'info', c.fromId);
}

const actions = {
  login(k, d) {
    Object.assign(panels[k], { user: d.id, view: k === 'res' ? 'list' : 'alerts', patientId: null, modal: null, editing: null, filter: 'all', alertFilter: null });
  },
  logout(k) { Object.assign(panels[k], { user: null, patientId: null, modal: null, editing: null, loginError: false, remote: false }); },
  // الاستشاري: التبديل بين المستشفى والبيت
  remote(k) {
    const P = panels[k];
    P.remote = !P.remote;
    P.editing = null;
    if (P.remote && P.view === 'access') P.view = 'alerts';
    toast(k, t(P.remote ? 'remote.toastOn' : 'remote.toastOff'), 'ok');
  },
  // الحسابات التجريبية: تعبّي اسم المستخدم وكلمة المرور
  fill(k, d) {
    const sec = document.getElementById('panel-' + k);
    sec.querySelector('[data-k="lu"]').value = USERS[d.id].username;
    sec.querySelector('[data-k="lp"]').value = DEMO_PASSWORD;
    panels[k].loginError = false;
  },
  nav(k, d) { Object.assign(panels[k], { view: d.v, patientId: null, editing: null }); },
  filter(k, d) { panels[k].filter = d.v; },
  stat(k, d) { panels[k].alertFilter = panels[k].alertFilter === d.f ? null : d.f; },
  feature(k, d) { panels[k].modal = { type: 'feature', f: d.f }; },
  backdrop(k) { panels[k].modal = null; },
  // الإعدادات: تفعيل الكل / إيقاف الكل / الافتراضي
  'set-preset'(k, d) {
    for (const f in homeSettings) homeSettings[f] = d.p === 'all' ? true : d.p === 'none' ? false : HOME_DEFAULTS[f];
    toast(k, t('set.saved'), 'ok');
  },
  review(k, d) {
    const r = db.results.find((x) => x.id === d.id);
    r.reviewed = true; r.reviewedBy = panels[k].user; touch(r, panels[k].user);
    toast(k, t('toast.reviewed'), 'ok');
  },
  cosign(k, d) {
    const P = panels[k], list = d.kind === 'note' ? db.notes : db.orders, r = list.find((x) => x.id === d.id);
    Object.assign(r, { cosignedBy: P.user, cosignedAt: Date.now(), cosignRemote: !!P.remote });
    touch(r, P.user);
    toast(k, t('toast.cosigned'), 'ok');
    notify(r.authorId, t('toast.cosignedRes', { u: UN(P.user), what: t('cs.' + d.kind), p: PN(r.patientId) }), 'ok');
  },
  // طلب الاستشارة صار زر صغير في رأس الملف يفتح نافذة
  'consult-open'(k) { panels[k].modal = { type: 'consult' }; },
  'inbox-read'(k) { db.inbox.forEach((m) => { if (m.to === panels[k].user) m.read = true; }); },
  'open-patient'(k, d) {
    const P = panels[k];
    if (k === 'res' && !grantOf(P.user, d.id)) return toast(k, t('toast.noAccess'), 'danger');
    if (k === 'con' && !can(k, 'patients')) return toast(k, t('remote.blocked'), 'danger');
    if (P.view !== 'patient') P.prevView = P.view;
    Object.assign(P, { view: 'patient', patientId: d.id, tab: d.tab || 'summary', editing: null });
  },
  back(k) { const P = panels[k]; Object.assign(P, { view: P.prevView, patientId: null, editing: null }); },
  tab(k, d) { Object.assign(panels[k], { tab: d.t, editing: null }); },
  otype(k, d) { panels[k].orderType = d.t; },
  edit(k, d) { panels[k].editing = { id: d.id }; },
  'edit-cancel'(k) { panels[k].editing = null; },
  'save-note'(k, d) {
    const P = panels[k], n = db.notes.find((x) => x.id === d.id), text = val(k, 'edit-' + d.id);
    P.editing = null;
    if (!text || text === n.text) return;
    n.edited = { original: n.edited?.original ?? n.text, by: P.user, time: Date.now() };
    n.text = text;
    touch(n, P.user);
    toast(k, t('toast.editSaved'), 'ok');
    if (n.authorId !== P.user) notify(n.authorId, t('toast.noteEdited', { u: UN(P.user), p: PN(n.patientId) }), 'warn');
  },
  'save-order'(k, d) {
    const P = panels[k], o = db.orders.find((x) => x.id === d.id);
    const newItem = val(k, 'eitem-' + d.id) || o.item, details = val(k, 'edet-' + d.id);
    P.editing = null;
    if (newItem === o.item && details === (o.details || '')) return;
    o.modified = { original: `${item(o.item).name}${o.details ? ' (' + o.details + ')' : ''}`, by: P.user, time: Date.now() };
    Object.assign(o, { item: newItem, details, status: 'modified' });
    touch(o, P.user);
    toast(k, t('toast.orderEditSaved'), 'ok');
    if (o.authorId !== P.user) notify(o.authorId, t('toast.orderEdited', { u: UN(P.user), i: item(newItem).name, p: PN(o.patientId) }), 'warn');
  },
  void(k, d) { panels[k].modal = { type: 'cancel', kind: d.kind, id: d.id }; },
  reject(k, d) { panels[k].modal = { type: 'reject', id: d.id }; },
  approve(k, d) {
    const P = panels[k], o = db.orders.find((x) => x.id === d.id);
    Object.assign(o, { status: 'active', approvedBy: P.user, approvedAt: Date.now(), approvedRemote: !!P.remote });
    scheduleResult(o);
    touch(o, P.user);
    toast(k, t('toast.approved'), 'ok');
    notify(o.authorId, t('toast.approvedNew', { u: UN(P.user), i: item(o.item).name, p: PN(o.patientId) }), 'ok');
  },
  quick(k, d) { if (can(k, 'consults')) sendReply(k, d.id, d.text); },
  'close-modal'(k) { panels[k].modal = null; },
  'pick-res'(k, d) { panels[k].grantResident = d.id; },
};

const forms = {
  login(k, f) {
    const P = panels[k], name = f.username.trim().toLowerCase();
    const u = Object.values(USERS).find((x) => x.role === P.role && x.username === name);
    if (!u || f.password !== DEMO_PASSWORD) { P.loginError = true; return; }
    P.loginError = false;
    actions.login(k, { id: u.id });
  },
  note(k, f) { addNote(k, f.text.trim()); },
  order(k, f) { placeOrder(k, f.item, f.details.trim(), !!f.erx); },
  media(k, f) {
    const P = panels[k], file = f.file;
    if (!file || !file.size) return;
    const reader = new FileReader();
    reader.onload = () => {
      const m = { id: uid('img'), patientId: P.patientId, by: P.user, time: Date.now(), src: reader.result, caption: f.caption.trim(), remote: k === 'con' && !!P.remote };
      touch(m, P.user);
      db.media.push(m);
      toast(k, t('toast.mediaAdded'), 'ok');
      update();
    };
    reader.readAsDataURL(file);
  },
  consult(k, f) {
    const P = panels[k], p = pat(P.patientId), me = P.user;
    P.modal = null;
    if (!residentCanWrite(me, p.id)) return toast(k, t('toast.readonly'), 'danger');
    const now = Date.now();
    const c = { id: uid('cs'), patientId: p.id, fromId: me, toId: p.consultantId, urgency: f.urgency, time: now, deadline: now + URGENCY[f.urgency].ms, status: 'open', replies: [], question: f.question.trim() };
    touch(c, me);
    db.consults.push(c);
    toast(k, t('toast.consultSent', { c: UN(p.consultantId) }), 'ok');
    notify(p.consultantId, t('toast.consultNew', { l: urgLabel(f.urgency), p: N(p), u: UN(me) }), f.urgency === 'emergency' ? 'danger' : 'warn');
  },
  reply(k, f, el) { sendReply(k, el.dataset.id, f.text.trim()); },
  justify(k, f) { const m = panels[k].modal; panels[k].modal = null; createOrder(k, m.draft, { justification: f.j.trim() }); },
  approval(k, f) { const m = panels[k].modal; panels[k].modal = null; createOrder(k, m.draft, { status: 'pending', requestReason: f.reason.trim() }); },
  cancel(k, f) {
    const P = panels[k], m = P.modal, by = P.user, reason = f.reason.trim();
    P.modal = null;
    if (m.kind === 'note') {
      const n = db.notes.find((x) => x.id === m.id);
      n.status = 'voided'; n.voided = { by, reason, time: Date.now() }; touch(n, by);
      if (n.authorId !== by) notify(n.authorId, t('toast.noteVoided', { u: UN(by), p: PN(n.patientId) }), 'danger');
    } else {
      const o = db.orders.find((x) => x.id === m.id);
      o.status = 'cancelled'; o.cancelled = { by, reason }; touch(o, by);
      if (o.authorId !== by) notify(o.authorId, t('toast.orderCancelled', { u: UN(by), i: item(o.item).name, p: PN(o.patientId) }), 'danger');
    }
    toast(k, t('toast.cancelled'), 'ok');
  },
  reject(k, f) {
    const P = panels[k], o = db.orders.find((x) => x.id === P.modal.id);
    P.modal = null;
    o.status = 'rejected'; o.cancelled = { by: P.user, reason: f.reason.trim() }; touch(o, P.user);
    toast(k, t('toast.rejected'), 'ok');
    notify(o.authorId, t('toast.rejectedNew', { u: UN(P.user), i: item(o.item).name, p: PN(o.patientId) }), 'danger');
  },
};

function onGrantChange(k, el) {
  const me = panels[k].user, r = el.dataset.r, pid = el.dataset.p, p = pat(pid);
  if (!isUnderName(me, pid)) return;
  if (el.dataset.change === 'grant') {
    if (el.checked) {
      db.grants.push({ residentId: r, patientId: pid, level: 'read' });
      notify(r, t('toast.granted', { u: UN(me), p: N(p) }), 'ok');
      toast(k, t('toast.grantedCon', { r: UN(r), p: N(p) }), 'ok');
    } else {
      db.grants = db.grants.filter((g) => !(g.residentId === r && g.patientId === pid));
      notify(r, t('toast.revoked', { p: N(p) }), 'danger');
      toast(k, t('toast.revokedCon', { r: UN(r) }), 'ok');
      const R = panels.res;
      if (R.user === r && R.patientId === pid) Object.assign(R, { view: 'list', patientId: null, modal: null });
    }
  } else {
    const g = grantOf(r, pid);
    if (!g) return;
    g.level = el.value;
    notify(r, t('toast.levelChanged', { p: N(p), l: LEVEL_SHORT[g.level] }), 'warn');
    toast(k, t('toast.levelUpdated'), 'ok');
  }
}

/* =========================================================
   ربط الأحداث
   ========================================================= */
for (const k of ['res', 'con']) {
  const sec = document.getElementById('panel-' + k);
  sec.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || !sec.contains(b)) return;
    // الضغط داخل النافذة المنبثقة نفسها لا يغلقها ولا يعيد الرسم (عشان ما ينقطع الإرسال)
    if (b.dataset.action === 'backdrop' && e.target !== b) return;
    const fn = actions[b.dataset.action];
    if (!fn) return;
    fn(k, b.dataset, b, e);
    update();
  });
  sec.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, fn = forms[f.dataset.form];
    if (!fn) return;
    const data = Object.fromEntries(new FormData(f));
    if (f.dataset.form !== 'login') f.reset(); // نموذج الدخول يحتفظ باسم المستخدم لو كانت البيانات خطأ
    fn(k, data, f);
    update();
  });
  sec.addEventListener('change', (e) => {
    const ch = e.target.dataset.change;
    if (ch === 'home') { homeSettings[e.target.dataset.f] = e.target.checked; toast(k, t('set.saved'), 'ok'); update(); }
    else if (ch) { onGrantChange(k, e.target); update(); }
  });
}

// تحديث العدّادات كل ثانية بدون إعادة رسم كاملة
setInterval(() => {
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    const left = +el.dataset.deadline - Date.now();
    el.textContent = fmtLeft(left);
    el.className = 'timer ' + timerCls(left);
  });
}, 1000);

// رسائل أولية في صندوق الاستشاري (In Basket)
db.inbox.push(
  { id: 'ib1', to: 'c3', time: NOW - 15 * MIN, read: false, msg: t('toast.pendingNew', { i: item('TPA').name, p: PN('p9'), u: UN('r4') }) },
  { id: 'ib2', to: 'c3', time: NOW - 20 * MIN, read: false, msg: t('toast.consultNew', { l: urgLabel('emergency'), p: PN('p9'), u: UN('r4') }) },
  { id: 'ib3', to: 'c3', time: NOW - 30 * MIN, read: true, msg: t('toast.resultNew', { r: 'CSF protein 1.2 g/L', p: PN('p11') }) },
);

// الطلبات اللي لسا ما طلعت نتيجتها: تطلع بعد ثواني من فتح الصفحة (للعرض)
db.orders.forEach((o) => { if (['active', 'modified'].includes(o.status)) scheduleResult(o); });

applyLang();
