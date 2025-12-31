import { useTheme } from '@/app/context/ThemeContext';
import { getSurahsOnPage } from '@/constants/surahs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppState,
  AppStateStatus,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, FeColorMatrix, Filter, Image as SvgImage } from 'react-native-svg';

// Generate all page names from 'aa' to 'xl'
function generatePageNames(): string[] {
  const pages: string[] = [];
  const firstLetters = 'abcdefghijklmnopqrstuvwx'; // a to x
  const secondLetters = 'abcdefghijklmnopqrstuvwxyz'; // a to z

  for (let i = 0; i < firstLetters.length; i++) {
    const firstLetter = firstLetters[i];
    // For 'x', only go up to 'l', otherwise go to 'z'
    const maxSecondLetter = firstLetter === 'x' ? 'l' : 'z';
    const maxIndex = secondLetters.indexOf(maxSecondLetter);

    for (let j = 0; j <= maxIndex; j++) {
      pages.push(firstLetter + secondLetters[j]);
    }
  }

  // Insert 'ozz' after 'oz' and before 'pa'
  const ozIndex = pages.indexOf('oz');
  if (ozIndex !== -1) {
    pages.splice(ozIndex + 1, 0, 'ozz');
  }

  return pages;
}

// Helper function to get image source dynamically
function getImageSource(pageName: string) {
  const images: { [key: string]: any } = {
    'aa': require('@/assets/pages/aa.jpg'),
    'ab': require('@/assets/pages/ab.jpg'),
    'ac': require('@/assets/pages/ac.jpg'),
    'ad': require('@/assets/pages/ad.jpg'),
    'ae': require('@/assets/pages/ae.jpg'),
    'af': require('@/assets/pages/af.jpg'),
    'ag': require('@/assets/pages/ag.jpg'),
    'ah': require('@/assets/pages/ah.jpg'),
    'ai': require('@/assets/pages/ai.jpg'),
    'aj': require('@/assets/pages/aj.jpg'),
    'ak': require('@/assets/pages/ak.jpg'),
    'al': require('@/assets/pages/al.jpg'),
    'am': require('@/assets/pages/am.jpg'),
    'an': require('@/assets/pages/an.jpg'),
    'ao': require('@/assets/pages/ao.jpg'),
    'ap': require('@/assets/pages/ap.jpg'),
    'aq': require('@/assets/pages/aq.jpg'),
    'ar': require('@/assets/pages/ar.jpg'),
    'as': require('@/assets/pages/as.jpg'),
    'at': require('@/assets/pages/at.jpg'),
    'au': require('@/assets/pages/au.jpg'),
    'av': require('@/assets/pages/av.jpg'),
    'aw': require('@/assets/pages/aw.jpg'),
    'ax': require('@/assets/pages/ax.jpg'),
    'ay': require('@/assets/pages/ay.jpg'),
    'az': require('@/assets/pages/az.jpg'),
    'ba': require('@/assets/pages/ba.jpg'),
    'bb': require('@/assets/pages/bb.jpg'),
    'bc': require('@/assets/pages/bc.jpg'),
    'bd': require('@/assets/pages/bd.jpg'),
    'be': require('@/assets/pages/be.jpg'),
    'bf': require('@/assets/pages/bf.jpg'),
    'bg': require('@/assets/pages/bg.jpg'),
    'bh': require('@/assets/pages/bh.jpg'),
    'bi': require('@/assets/pages/bi.jpg'),
    'bj': require('@/assets/pages/bj.jpg'),
    'bk': require('@/assets/pages/bk.jpg'),
    'bl': require('@/assets/pages/bl.jpg'),
    'bm': require('@/assets/pages/bm.jpg'),
    'bn': require('@/assets/pages/bn.jpg'),
    'bo': require('@/assets/pages/bo.jpg'),
    'bp': require('@/assets/pages/bp.jpg'),
    'bq': require('@/assets/pages/bq.jpg'),
    'br': require('@/assets/pages/br.jpg'),
    'bs': require('@/assets/pages/bs.jpg'),
    'bt': require('@/assets/pages/bt.jpg'),
    'bu': require('@/assets/pages/bu.jpg'),
    'bv': require('@/assets/pages/bv.jpg'),
    'bw': require('@/assets/pages/bw.jpg'),
    'bx': require('@/assets/pages/bx.jpg'),
    'by': require('@/assets/pages/by.jpg'),
    'bz': require('@/assets/pages/bz.jpg'),
    'ca': require('@/assets/pages/ca.jpg'),
    'cb': require('@/assets/pages/cb.jpg'),
    'cc': require('@/assets/pages/cc.jpg'),
    'cd': require('@/assets/pages/cd.jpg'),
    'ce': require('@/assets/pages/ce.jpg'),
    'cf': require('@/assets/pages/cf.jpg'),
    'cg': require('@/assets/pages/cg.jpg'),
    'ch': require('@/assets/pages/ch.jpg'),
    'ci': require('@/assets/pages/ci.jpg'),
    'cj': require('@/assets/pages/cj.jpg'),
    'ck': require('@/assets/pages/ck.jpg'),
    'cl': require('@/assets/pages/cl.jpg'),
    'cm': require('@/assets/pages/cm.jpg'),
    'cn': require('@/assets/pages/cn.jpg'),
    'co': require('@/assets/pages/co.jpg'),
    'cp': require('@/assets/pages/cp.jpg'),
    'cq': require('@/assets/pages/cq.jpg'),
    'cr': require('@/assets/pages/cr.jpg'),
    'cs': require('@/assets/pages/cs.jpg'),
    'ct': require('@/assets/pages/ct.jpg'),
    'cu': require('@/assets/pages/cu.jpg'),
    'cv': require('@/assets/pages/cv.jpg'),
    'cw': require('@/assets/pages/cw.jpg'),
    'cx': require('@/assets/pages/cx.jpg'),
    'cy': require('@/assets/pages/cy.jpg'),
    'cz': require('@/assets/pages/cz.jpg'),
    'da': require('@/assets/pages/da.jpg'),
    'db': require('@/assets/pages/db.jpg'),
    'dc': require('@/assets/pages/dc.jpg'),
    'dd': require('@/assets/pages/dd.jpg'),
    'de': require('@/assets/pages/de.jpg'),
    'df': require('@/assets/pages/df.jpg'),
    'dg': require('@/assets/pages/dg.jpg'),
    'dh': require('@/assets/pages/dh.jpg'),
    'di': require('@/assets/pages/di.jpg'),
    'dj': require('@/assets/pages/dj.jpg'),
    'dk': require('@/assets/pages/dk.jpg'),
    'dl': require('@/assets/pages/dl.jpg'),
    'dm': require('@/assets/pages/dm.jpg'),
    'dn': require('@/assets/pages/dn.jpg'),
    'do': require('@/assets/pages/doo.jpg'),
    'dp': require('@/assets/pages/dp.jpg'),
    'dq': require('@/assets/pages/dq.jpg'),
    'dr': require('@/assets/pages/dr.jpg'),
    'ds': require('@/assets/pages/ds.jpg'),
    'dt': require('@/assets/pages/dt.jpg'),
    'du': require('@/assets/pages/du.jpg'),
    'dv': require('@/assets/pages/dv.jpg'),
    'dw': require('@/assets/pages/dw.jpg'),
    'dx': require('@/assets/pages/dx.jpg'),
    'dy': require('@/assets/pages/dy.jpg'),
    'dz': require('@/assets/pages/dz.jpg'),
    'ea': require('@/assets/pages/ea.jpg'),
    'eb': require('@/assets/pages/eb.jpg'),
    'ec': require('@/assets/pages/ec.jpg'),
    'ed': require('@/assets/pages/ed.jpg'),
    'ee': require('@/assets/pages/ee.jpg'),
    'ef': require('@/assets/pages/ef.jpg'),
    'eg': require('@/assets/pages/eg.jpg'),
    'eh': require('@/assets/pages/eh.jpg'),
    'ei': require('@/assets/pages/ei.jpg'),
    'ej': require('@/assets/pages/ej.jpg'),
    'ek': require('@/assets/pages/ek.jpg'),
    'el': require('@/assets/pages/el.jpg'),
    'em': require('@/assets/pages/em.jpg'),
    'en': require('@/assets/pages/en.jpg'),
    'eo': require('@/assets/pages/eo.jpg'),
    'ep': require('@/assets/pages/ep.jpg'),
    'eq': require('@/assets/pages/eq.jpg'),
    'er': require('@/assets/pages/er.jpg'),
    'es': require('@/assets/pages/es.jpg'),
    'et': require('@/assets/pages/et.jpg'),
    'eu': require('@/assets/pages/eu.jpg'),
    'ev': require('@/assets/pages/ev.jpg'),
    'ew': require('@/assets/pages/ew.jpg'),
    'ex': require('@/assets/pages/ex.jpg'),
    'ey': require('@/assets/pages/ey.jpg'),
    'ez': require('@/assets/pages/ez.jpg'),
    'fa': require('@/assets/pages/fa.jpg'),
    'fb': require('@/assets/pages/fb.jpg'),
    'fc': require('@/assets/pages/fc.jpg'),
    'fd': require('@/assets/pages/fd.jpg'),
    'fe': require('@/assets/pages/fe.jpg'),
    'ff': require('@/assets/pages/ff.jpg'),
    'fg': require('@/assets/pages/fg.jpg'),
    'fh': require('@/assets/pages/fh.jpg'),
    'fi': require('@/assets/pages/fi.jpg'),
    'fj': require('@/assets/pages/fj.jpg'),
    'fk': require('@/assets/pages/fk.jpg'),
    'fl': require('@/assets/pages/fl.jpg'),
    'fm': require('@/assets/pages/fm.jpg'),
    'fn': require('@/assets/pages/fn.jpg'),
    'fo': require('@/assets/pages/fo.jpg'),
    'fp': require('@/assets/pages/fp.jpg'),
    'fq': require('@/assets/pages/fq.jpg'),
    'fr': require('@/assets/pages/fr.jpg'),
    'fs': require('@/assets/pages/fs.jpg'),
    'ft': require('@/assets/pages/ft.jpg'),
    'fu': require('@/assets/pages/fu.jpg'),
    'fv': require('@/assets/pages/fv.jpg'),
    'fw': require('@/assets/pages/fw.jpg'),
    'fx': require('@/assets/pages/fx.jpg'),
    'fy': require('@/assets/pages/fy.jpg'),
    'fz': require('@/assets/pages/fz.jpg'),
    'ga': require('@/assets/pages/ga.jpg'),
    'gb': require('@/assets/pages/gb.jpg'),
    'gc': require('@/assets/pages/gc.jpg'),
    'gd': require('@/assets/pages/gd.jpg'),
    'ge': require('@/assets/pages/ge.jpg'),
    'gf': require('@/assets/pages/gf.jpg'),
    'gg': require('@/assets/pages/gg.jpg'),
    'gh': require('@/assets/pages/gh.jpg'),
    'gi': require('@/assets/pages/gi.jpg'),
    'gj': require('@/assets/pages/gj.jpg'),
    'gk': require('@/assets/pages/gk.jpg'),
    'gl': require('@/assets/pages/gl.jpg'),
    'gm': require('@/assets/pages/gm.jpg'),
    'gn': require('@/assets/pages/gn.jpg'),
    'go': require('@/assets/pages/go.jpg'),
    'gp': require('@/assets/pages/gp.jpg'),
    'gq': require('@/assets/pages/gq.jpg'),
    'gr': require('@/assets/pages/gr.jpg'),
    'gs': require('@/assets/pages/gs.jpg'),
    'gt': require('@/assets/pages/gt.jpg'),
    'gu': require('@/assets/pages/gu.jpg'),
    'gv': require('@/assets/pages/gv.jpg'),
    'gw': require('@/assets/pages/gw.jpg'),
    'gx': require('@/assets/pages/gx.jpg'),
    'gy': require('@/assets/pages/gy.jpg'),
    'gz': require('@/assets/pages/gz.jpg'),
    'ha': require('@/assets/pages/ha.jpg'),
    'hb': require('@/assets/pages/hb.jpg'),
    'hc': require('@/assets/pages/hc.jpg'),
    'hd': require('@/assets/pages/hd.jpg'),
    'he': require('@/assets/pages/he.jpg'),
    'hf': require('@/assets/pages/hf.jpg'),
    'hg': require('@/assets/pages/hg.jpg'),
    'hh': require('@/assets/pages/hh.jpg'),
    'hi': require('@/assets/pages/hi.jpg'),
    'hj': require('@/assets/pages/hj.jpg'),
    'hk': require('@/assets/pages/hk.jpg'),
    'hl': require('@/assets/pages/hl.jpg'),
    'hm': require('@/assets/pages/hm.jpg'),
    'hn': require('@/assets/pages/hn.jpg'),
    'ho': require('@/assets/pages/ho.jpg'),
    'hp': require('@/assets/pages/hp.jpg'),
    'hq': require('@/assets/pages/hq.jpg'),
    'hr': require('@/assets/pages/hr.jpg'),
    'hs': require('@/assets/pages/hs.jpg'),
    'ht': require('@/assets/pages/ht.jpg'),
    'hu': require('@/assets/pages/hu.jpg'),
    'hv': require('@/assets/pages/hv.jpg'),
    'hw': require('@/assets/pages/hw.jpg'),
    'hx': require('@/assets/pages/hx.jpg'),
    'hy': require('@/assets/pages/hy.jpg'),
    'hz': require('@/assets/pages/hz.jpg'),
    'ia': require('@/assets/pages/ia.jpg'),
    'ib': require('@/assets/pages/ib.jpg'),
    'ic': require('@/assets/pages/ic.jpg'),
    'id': require('@/assets/pages/id.jpg'),
    'ie': require('@/assets/pages/ie.jpg'),
    'if': require('@/assets/pages/iff.jpg'),
    'ig': require('@/assets/pages/ig.jpg'),
    'ih': require('@/assets/pages/ih.jpg'),
    'ii': require('@/assets/pages/ii.jpg'),
    'ij': require('@/assets/pages/ij.jpg'),
    'ik': require('@/assets/pages/ik.jpg'),
    'il': require('@/assets/pages/il.jpg'),
    'im': require('@/assets/pages/im.jpg'),
    'in': require('@/assets/pages/in.jpg'),
    'io': require('@/assets/pages/io.jpg'),
    'ip': require('@/assets/pages/ip.jpg'),
    'iq': require('@/assets/pages/iq.jpg'),
    'ir': require('@/assets/pages/ir.jpg'),
    'is': require('@/assets/pages/is.jpg'),
    'it': require('@/assets/pages/it.jpg'),
    'iu': require('@/assets/pages/iu.jpg'),
    'iv': require('@/assets/pages/iv.jpg'),
    'iw': require('@/assets/pages/iw.jpg'),
    'ix': require('@/assets/pages/ix.jpg'),
    'iy': require('@/assets/pages/iy.jpg'),
    'iz': require('@/assets/pages/iz.jpg'),
    'ja': require('@/assets/pages/ja.jpg'),
    'jb': require('@/assets/pages/jb.jpg'),
    'jc': require('@/assets/pages/jc.jpg'),
    'jd': require('@/assets/pages/jd.jpg'),
    'je': require('@/assets/pages/je.jpg'),
    'jf': require('@/assets/pages/jf.jpg'),
    'jg': require('@/assets/pages/jg.jpg'),
    'jh': require('@/assets/pages/jh.jpg'),
    'ji': require('@/assets/pages/ji.jpg'),
    'jj': require('@/assets/pages/jj.jpg'),
    'jk': require('@/assets/pages/jk.jpg'),
    'jl': require('@/assets/pages/jl.jpg'),
    'jm': require('@/assets/pages/jm.jpg'),
    'jn': require('@/assets/pages/jn.jpg'),
    'jo': require('@/assets/pages/jo.jpg'),
    'jp': require('@/assets/pages/jp.jpg'),
    'jq': require('@/assets/pages/jq.jpg'),
    'jr': require('@/assets/pages/jr.jpg'),
    'js': require('@/assets/pages/js.jpg'),
    'jt': require('@/assets/pages/jt.jpg'),
    'ju': require('@/assets/pages/ju.jpg'),
    'jv': require('@/assets/pages/jv.jpg'),
    'jw': require('@/assets/pages/jw.jpg'),
    'jx': require('@/assets/pages/jx.jpg'),
    'jy': require('@/assets/pages/jy.jpg'),
    'jz': require('@/assets/pages/jz.jpg'),
    'ka': require('@/assets/pages/ka.jpg'),
    'kb': require('@/assets/pages/kb.jpg'),
    'kc': require('@/assets/pages/kc.jpg'),
    'kd': require('@/assets/pages/kd.jpg'),
    'ke': require('@/assets/pages/ke.jpg'),
    'kf': require('@/assets/pages/kf.jpg'),
    'kg': require('@/assets/pages/kg.jpg'),
    'kh': require('@/assets/pages/kh.jpg'),
    'ki': require('@/assets/pages/ki.jpg'),
    'kj': require('@/assets/pages/kj.jpg'),
    'kk': require('@/assets/pages/kk.jpg'),
    'kl': require('@/assets/pages/kl.jpg'),
    'km': require('@/assets/pages/km.jpg'),
    'kn': require('@/assets/pages/kn.jpg'),
    'ko': require('@/assets/pages/ko.jpg'),
    'kp': require('@/assets/pages/kp.jpg'),
    'kq': require('@/assets/pages/kq.jpg'),
    'kr': require('@/assets/pages/kr.jpg'),
    'ks': require('@/assets/pages/ks.jpg'),
    'kt': require('@/assets/pages/kt.jpg'),
    'ku': require('@/assets/pages/ku.jpg'),
    'kv': require('@/assets/pages/kv.jpg'),
    'kw': require('@/assets/pages/kw.jpg'),
    'kx': require('@/assets/pages/kx.jpg'),
    'ky': require('@/assets/pages/ky.jpg'),
    'kz': require('@/assets/pages/kz.jpg'),
    'la': require('@/assets/pages/la.jpg'),
    'lb': require('@/assets/pages/lb.jpg'),
    'lc': require('@/assets/pages/lc.jpg'),
    'ld': require('@/assets/pages/ld.jpg'),
    'le': require('@/assets/pages/le.jpg'),
    'lf': require('@/assets/pages/lf.jpg'),
    'lg': require('@/assets/pages/lg.jpg'),
    'lh': require('@/assets/pages/lh.jpg'),
    'li': require('@/assets/pages/li.jpg'),
    'lj': require('@/assets/pages/lj.jpg'),
    'lk': require('@/assets/pages/lk.jpg'),
    'll': require('@/assets/pages/ll.jpg'),
    'lm': require('@/assets/pages/lm.jpg'),
    'ln': require('@/assets/pages/ln.jpg'),
    'lo': require('@/assets/pages/lo.jpg'),
    'lp': require('@/assets/pages/lp.jpg'),
    'lq': require('@/assets/pages/lq.jpg'),
    'lr': require('@/assets/pages/lr.jpg'),
    'ls': require('@/assets/pages/ls.jpg'),
    'lt': require('@/assets/pages/lt.jpg'),
    'lu': require('@/assets/pages/lu.jpg'),
    'lv': require('@/assets/pages/lv.jpg'),
    'lw': require('@/assets/pages/lw.jpg'),
    'lx': require('@/assets/pages/lx.jpg'),
    'ly': require('@/assets/pages/ly.jpg'),
    'lz': require('@/assets/pages/lz.jpg'),
    'ma': require('@/assets/pages/ma.jpg'),
    'mb': require('@/assets/pages/mb.jpg'),
    'mc': require('@/assets/pages/mc.jpg'),
    'md': require('@/assets/pages/md.jpg'),
    'me': require('@/assets/pages/me.jpg'),
    'mf': require('@/assets/pages/mf.jpg'),
    'mg': require('@/assets/pages/mg.jpg'),
    'mh': require('@/assets/pages/mh.jpg'),
    'mi': require('@/assets/pages/mi.jpg'),
    'mj': require('@/assets/pages/mj.jpg'),
    'mk': require('@/assets/pages/mk.jpg'),
    'ml': require('@/assets/pages/ml.jpg'),
    'mm': require('@/assets/pages/mm.jpg'),
    'mn': require('@/assets/pages/mn.jpg'),
    'mo': require('@/assets/pages/mo.jpg'),
    'mp': require('@/assets/pages/mp.jpg'),
    'mq': require('@/assets/pages/mq.jpg'),
    'mr': require('@/assets/pages/mr.jpg'),
    'ms': require('@/assets/pages/ms.jpg'),
    'mt': require('@/assets/pages/mt.jpg'),
    'mu': require('@/assets/pages/mu.jpg'),
    'mv': require('@/assets/pages/mv.jpg'),
    'mw': require('@/assets/pages/mw.jpg'),
    'mx': require('@/assets/pages/mx.jpg'),
    'my': require('@/assets/pages/my.jpg'),
    'mz': require('@/assets/pages/mz.jpg'),
    'na': require('@/assets/pages/na.jpg'),
    'nb': require('@/assets/pages/nb.jpg'),
    'nc': require('@/assets/pages/nc.jpg'),
    'nd': require('@/assets/pages/nd.jpg'),
    'ne': require('@/assets/pages/ne.jpg'),
    'nf': require('@/assets/pages/nf.jpg'),
    'ng': require('@/assets/pages/ng.jpg'),
    'nh': require('@/assets/pages/nh.jpg'),
    'ni': require('@/assets/pages/ni.jpg'),
    'nj': require('@/assets/pages/nj.jpg'),
    'nk': require('@/assets/pages/nk.jpg'),
    'nl': require('@/assets/pages/nl.jpg'),
    'nm': require('@/assets/pages/nm.jpg'),
    'nn': require('@/assets/pages/nn.jpg'),
    'no': require('@/assets/pages/no.jpg'),
    'np': require('@/assets/pages/np.jpg'),
    'nq': require('@/assets/pages/nq.jpg'),
    'nr': require('@/assets/pages/nr.jpg'),
    'ns': require('@/assets/pages/ns.jpg'),
    'nt': require('@/assets/pages/nt.jpg'),
    'nu': require('@/assets/pages/nu.jpg'),
    'nv': require('@/assets/pages/nv.jpg'),
    'nw': require('@/assets/pages/nw.jpg'),
    'nx': require('@/assets/pages/nx.jpg'),
    'ny': require('@/assets/pages/ny.jpg'),
    'nz': require('@/assets/pages/nz.jpg'),
    'oa': require('@/assets/pages/oa.jpg'),
    'ob': require('@/assets/pages/ob.jpg'),
    'oc': require('@/assets/pages/oc.jpg'),
    'od': require('@/assets/pages/od.jpg'),
    'oe': require('@/assets/pages/oe.jpg'),
    'of': require('@/assets/pages/of.jpg'),
    'og': require('@/assets/pages/og.jpg'),
    'oh': require('@/assets/pages/oh.jpg'),
    'oi': require('@/assets/pages/oi.jpg'),
    'oj': require('@/assets/pages/oj.jpg'),
    'ok': require('@/assets/pages/ok.jpg'),
    'ol': require('@/assets/pages/ol.jpg'),
    'om': require('@/assets/pages/om.jpg'),
    'on': require('@/assets/pages/on.jpg'),
    'oo': require('@/assets/pages/oo.jpg'),
    'op': require('@/assets/pages/op.jpg'),
    'oq': require('@/assets/pages/oq.jpg'),
    'or': require('@/assets/pages/or.jpg'),
    'os': require('@/assets/pages/os.jpg'),
    'ot': require('@/assets/pages/ot.jpg'),
    'ou': require('@/assets/pages/ou.jpg'),
    'ov': require('@/assets/pages/ov.jpg'),
    'ow': require('@/assets/pages/ow.jpg'),
    'ox': require('@/assets/pages/ox.jpg'),
    'oy': require('@/assets/pages/oy.jpg'),
    'oz': require('@/assets/pages/oz.jpg'),
    'ozz': require('@/assets/pages/ozz.png'),
    'pa': require('@/assets/pages/pa.jpg'),
    'pb': require('@/assets/pages/pb.jpg'),
    'pc': require('@/assets/pages/pc.jpg'),
    'pd': require('@/assets/pages/pd.jpg'),
    'pe': require('@/assets/pages/pe.jpg'),
    'pf': require('@/assets/pages/pf.jpg'),
    'pg': require('@/assets/pages/pg.jpg'),
    'ph': require('@/assets/pages/ph.jpg'),
    'pi': require('@/assets/pages/pi.jpg'),
    'pj': require('@/assets/pages/pj.jpg'),
    'pk': require('@/assets/pages/pk.jpg'),
    'pl': require('@/assets/pages/pl.jpg'),
    'pm': require('@/assets/pages/pm.jpg'),
    'pn': require('@/assets/pages/pn.jpg'),
    'po': require('@/assets/pages/po.jpg'),
    'pp': require('@/assets/pages/pp.jpg'),
    'pq': require('@/assets/pages/pq.jpg'),
    'pr': require('@/assets/pages/pr.jpg'),
    'ps': require('@/assets/pages/ps.jpg'),
    'pt': require('@/assets/pages/pt.jpg'),
    'pu': require('@/assets/pages/pu.jpg'),
    'pv': require('@/assets/pages/pv.jpg'),
    'pw': require('@/assets/pages/pw.jpg'),
    'px': require('@/assets/pages/px.jpg'),
    'py': require('@/assets/pages/py.jpg'),
    'pz': require('@/assets/pages/pz.jpg'),
    'qa': require('@/assets/pages/qa.jpg'),
    'qb': require('@/assets/pages/qb.jpg'),
    'qc': require('@/assets/pages/qc.jpg'),
    'qd': require('@/assets/pages/qd.jpg'),
    'qe': require('@/assets/pages/qe.jpg'),
    'qf': require('@/assets/pages/qf.jpg'),
    'qg': require('@/assets/pages/qg.jpg'),
    'qh': require('@/assets/pages/qh.jpg'),
    'qi': require('@/assets/pages/qi.jpg'),
    'qj': require('@/assets/pages/qj.jpg'),
    'qk': require('@/assets/pages/qk.jpg'),
    'ql': require('@/assets/pages/ql.jpg'),
    'qm': require('@/assets/pages/qm.jpg'),
    'qn': require('@/assets/pages/qn.jpg'),
    'qo': require('@/assets/pages/qo.jpg'),
    'qp': require('@/assets/pages/qp.jpg'),
    'qq': require('@/assets/pages/qq.jpg'),
    'qr': require('@/assets/pages/qr.jpg'),
    'qs': require('@/assets/pages/qs.jpg'),
    'qt': require('@/assets/pages/qt.jpg'),
    'qu': require('@/assets/pages/qu.jpg'),
    'qv': require('@/assets/pages/qv.jpg'),
    'qw': require('@/assets/pages/qw.jpg'),
    'qx': require('@/assets/pages/qx.jpg'),
    'qy': require('@/assets/pages/qy.jpg'),
    'qz': require('@/assets/pages/qz.jpg'),
    'ra': require('@/assets/pages/ra.jpg'),
    'rb': require('@/assets/pages/rb.jpg'),
    'rc': require('@/assets/pages/rc.jpg'),
    'rd': require('@/assets/pages/rd.jpg'),
    're': require('@/assets/pages/re.jpg'),
    'rf': require('@/assets/pages/rf.jpg'),
    'rg': require('@/assets/pages/rg.jpg'),
    'rh': require('@/assets/pages/rh.jpg'),
    'ri': require('@/assets/pages/ri.jpg'),
    'rj': require('@/assets/pages/rj.jpg'),
    'rk': require('@/assets/pages/rk.jpg'),
    'rl': require('@/assets/pages/rl.jpg'),
    'rm': require('@/assets/pages/rm.jpg'),
    'rn': require('@/assets/pages/rn.jpg'),
    'ro': require('@/assets/pages/ro.jpg'),
    'rp': require('@/assets/pages/rp.jpg'),
    'rq': require('@/assets/pages/rq.jpg'),
    'rr': require('@/assets/pages/rr.jpg'),
    'rs': require('@/assets/pages/rs.jpg'),
    'rt': require('@/assets/pages/rt.jpg'),
    'ru': require('@/assets/pages/ru.jpg'),
    'rv': require('@/assets/pages/rv.jpg'),
    'rw': require('@/assets/pages/rw.jpg'),
    'rx': require('@/assets/pages/rx.jpg'),
    'ry': require('@/assets/pages/ry.jpg'),
    'rz': require('@/assets/pages/rz.jpg'),
    'sa': require('@/assets/pages/sa.jpg'),
    'sb': require('@/assets/pages/sb.jpg'),
    'sc': require('@/assets/pages/sc.jpg'),
    'sd': require('@/assets/pages/sd.jpg'),
    'se': require('@/assets/pages/se.jpg'),
    'sf': require('@/assets/pages/sf.jpg'),
    'sg': require('@/assets/pages/sg.jpg'),
    'sh': require('@/assets/pages/sh.jpg'),
    'si': require('@/assets/pages/si.jpg'),
    'sj': require('@/assets/pages/sj.jpg'),
    'sk': require('@/assets/pages/sk.jpg'),
    'sl': require('@/assets/pages/sl.jpg'),
    'sm': require('@/assets/pages/sm.jpg'),
    'sn': require('@/assets/pages/sn.jpg'),
    'so': require('@/assets/pages/so.jpg'),
    'sp': require('@/assets/pages/sp.jpg'),
    'sq': require('@/assets/pages/sq.jpg'),
    'sr': require('@/assets/pages/sr.jpg'),
    'ss': require('@/assets/pages/ss.jpg'),
    'st': require('@/assets/pages/st.jpg'),
    'su': require('@/assets/pages/su.jpg'),
    'sv': require('@/assets/pages/sv.jpg'),
    'sw': require('@/assets/pages/sw.jpg'),
    'sx': require('@/assets/pages/sx.jpg'),
    'sy': require('@/assets/pages/sy.jpg'),
    'sz': require('@/assets/pages/sz.jpg'),
    'ta': require('@/assets/pages/ta.jpg'),
    'tb': require('@/assets/pages/tb.jpg'),
    'tc': require('@/assets/pages/tc.jpg'),
    'td': require('@/assets/pages/td.jpg'),
    'te': require('@/assets/pages/te.jpg'),
    'tf': require('@/assets/pages/tf.jpg'),
    'tg': require('@/assets/pages/tg.jpg'),
    'th': require('@/assets/pages/th.jpg'),
    'ti': require('@/assets/pages/ti.jpg'),
    'tj': require('@/assets/pages/tj.jpg'),
    'tk': require('@/assets/pages/tk.jpg'),
    'tl': require('@/assets/pages/tl.jpg'),
    'tm': require('@/assets/pages/tm.jpg'),
    'tn': require('@/assets/pages/tn.jpg'),
    'to': require('@/assets/pages/to.jpg'),
    'tp': require('@/assets/pages/tp.jpg'),
    'tq': require('@/assets/pages/tq.jpg'),
    'tr': require('@/assets/pages/tr.jpg'),
    'ts': require('@/assets/pages/ts.jpg'),
    'tt': require('@/assets/pages/tt.jpg'),
    'tu': require('@/assets/pages/tu.jpg'),
    'tv': require('@/assets/pages/tv.jpg'),
    'tw': require('@/assets/pages/tw.jpg'),
    'tx': require('@/assets/pages/tx.jpg'),
    'ty': require('@/assets/pages/ty.jpg'),
    'tz': require('@/assets/pages/tz.jpg'),
    'ua': require('@/assets/pages/ua.jpg'),
    'ub': require('@/assets/pages/ub.jpg'),
    'uc': require('@/assets/pages/uc.jpg'),
    'ud': require('@/assets/pages/ud.jpg'),
    'ue': require('@/assets/pages/ue.jpg'),
    'uf': require('@/assets/pages/uf.jpg'),
    'ug': require('@/assets/pages/ug.jpg'),
    'uh': require('@/assets/pages/uh.jpg'),
    'ui': require('@/assets/pages/ui.jpg'),
    'uj': require('@/assets/pages/uj.jpg'),
    'uk': require('@/assets/pages/uk.jpg'),
    'ul': require('@/assets/pages/ul.jpg'),
    'um': require('@/assets/pages/um.jpg'),
    'un': require('@/assets/pages/un.jpg'),
    'uo': require('@/assets/pages/uo.jpg'),
    'up': require('@/assets/pages/up.jpg'),
    'uq': require('@/assets/pages/uq.jpg'),
    'ur': require('@/assets/pages/ur.jpg'),
    'us': require('@/assets/pages/us.jpg'),
    'ut': require('@/assets/pages/ut.jpg'),
    'uu': require('@/assets/pages/uu.jpg'),
    'uv': require('@/assets/pages/uv.jpg'),
    'uw': require('@/assets/pages/uw.jpg'),
    'ux': require('@/assets/pages/ux.jpg'),
    'uy': require('@/assets/pages/uy.jpg'),
    'uz': require('@/assets/pages/uz.jpg'),
    'va': require('@/assets/pages/va.jpg'),
    'vb': require('@/assets/pages/vb.jpg'),
    'vc': require('@/assets/pages/vc.jpg'),
    'vd': require('@/assets/pages/vd.jpg'),
    've': require('@/assets/pages/ve.jpg'),
    'vf': require('@/assets/pages/vf.jpg'),
    'vg': require('@/assets/pages/vg.jpg'),
    'vh': require('@/assets/pages/vh.jpg'),
    'vi': require('@/assets/pages/vi.jpg'),
    'vj': require('@/assets/pages/vj.jpg'),
    'vk': require('@/assets/pages/vk.jpg'),
    'vl': require('@/assets/pages/vl.jpg'),
    'vm': require('@/assets/pages/vm.jpg'),
    'vn': require('@/assets/pages/vn.jpg'),
    'vo': require('@/assets/pages/vo.jpg'),
    'vp': require('@/assets/pages/vp.jpg'),
    'vq': require('@/assets/pages/vq.jpg'),
    'vr': require('@/assets/pages/vr.jpg'),
    'vs': require('@/assets/pages/vs.jpg'),
    'vt': require('@/assets/pages/vt.jpg'),
    'vu': require('@/assets/pages/vu.jpg'),
    'vv': require('@/assets/pages/vv.jpg'),
    'vw': require('@/assets/pages/vw.jpg'),
    'vx': require('@/assets/pages/vx.jpg'),
    'vy': require('@/assets/pages/vy.jpg'),
    'vz': require('@/assets/pages/vz.jpg'),
    'wa': require('@/assets/pages/wa.jpg'),
    'wb': require('@/assets/pages/wb.jpg'),
    'wc': require('@/assets/pages/wc.jpg'),
    'wd': require('@/assets/pages/wd.jpg'),
    'we': require('@/assets/pages/we.jpg'),
    'wf': require('@/assets/pages/wf.jpg'),
    'wg': require('@/assets/pages/wg.jpg'),
    'wh': require('@/assets/pages/wh.jpg'),
    'wi': require('@/assets/pages/wi.jpg'),
    'wj': require('@/assets/pages/wj.jpg'),
    'wk': require('@/assets/pages/wk.jpg'),
    'wl': require('@/assets/pages/wl.jpg'),
    'wm': require('@/assets/pages/wm.jpg'),
    'wn': require('@/assets/pages/wn.jpg'),
    'wo': require('@/assets/pages/wo.jpg'),
    'wp': require('@/assets/pages/wp.jpg'),
    'wq': require('@/assets/pages/wq.jpg'),
    'wr': require('@/assets/pages/wr.jpg'),
    'ws': require('@/assets/pages/ws.jpg'),
    'wt': require('@/assets/pages/wt.jpg'),
    'wu': require('@/assets/pages/wu.jpg'),
    'wv': require('@/assets/pages/wv.jpg'),
    'ww': require('@/assets/pages/ww.jpg'),
    'wx': require('@/assets/pages/wx.jpg'),
    'wy': require('@/assets/pages/wy.jpg'),
    'wz': require('@/assets/pages/wz.jpg'),
    'xa': require('@/assets/pages/xa.jpg'),
    'xb': require('@/assets/pages/xb.jpg'),
    'xc': require('@/assets/pages/xc.jpg'),
    'xd': require('@/assets/pages/xd.jpg'),
    'xe': require('@/assets/pages/xe.jpg'),
    'xf': require('@/assets/pages/xf.jpg'),
    'xg': require('@/assets/pages/xg.jpg'),
    'xh': require('@/assets/pages/xh.jpg'),
    'xi': require('@/assets/pages/xi.jpg'),
    'xj': require('@/assets/pages/xj.jpg'),
    'xk': require('@/assets/pages/xk.jpg'),
    'xl': require('@/assets/pages/xl.jpg'),
  };

  return images[pageName] || null;
}

// Generate the page list once
const PAGE_NAMES = generatePageNames();
const PAGES = PAGE_NAMES.map(name => ({
  name,
  source: getImageSource(name),
})).filter(page => page.source !== null); // Filter out any missing images

// Pages that contain sajdah (prostration) in the Quran
// Note: Page numbers match the user's system where page 1 is empty, so Quran starts at page 2
const SAJDAH_PAGES = [
  177, // al-A’raf, 7:206
  252, // ar-Ra’d, 13:15
  273, // an-Nahl, 16:50
  294, // al-Isra, 17:109
  310, // Maryam, 19:58
  335, // al-Hajj, 22:18
  342, // al-Hajj, 22:77
  366, // al-Furqan, 25:60
  380, // an-Naml, 27:26
  417, // as-Sajdah, 32:15
  455, // Sad, 38:24
  481, // Fussilat, 41:38
  529, // an-Najm, 53:62
  590, // al-Inshiqaq, 84:21
  598  // al-Alaq, 96:19
];
// 177 (al-A’raf, 7:206)
// 252 (ar-Ra’d, 13:15)
type Bookmark = {
  id: string;
  name: string;
  sura: string;
  page: number;
  row?: number; // Optional row number for highlighter
  date: string;
  time: string;
  color: string;
};



const formatTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const SETTINGS_KEY = 'rowHighlighterEnabled';

// Try to import ColorMatrix at module level (will fail gracefully if not available)
// Removed react-native-color-matrix-image-filters as it is not compatible with Expo Go

// Helper component to conditionally apply color inversion
const InvertedImage = React.memo(({ source, style, contentFit, cachePolicy, isDarkMode }: {
  source: any;
  style: any;
  contentFit: any;
  cachePolicy: any;
  isDarkMode: boolean;
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // For web, wrap in a View with CSS filter applied to the container
  if (Platform.OS === 'web') {
    if (isDarkMode) {
      return (
        <View
          style={[
            style,
            {
              filter: 'invert(1)',
            } as any
          ]}
        >
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit={contentFit}
            cachePolicy={cachePolicy}
          />
        </View>
      );
    }
    return (
      <Image
        source={source}
        style={style}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
      />
    );
  }

  // For native, use Svg with FeColorMatrix if in dark mode
  if (isDarkMode) {
    return (
      <View
        style={[style, { overflow: 'hidden' }]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width !== layout.width || height !== layout.height) {
            setLayout({ width, height });
          }
        }}
      >
        {layout.width > 0 && layout.height > 0 ? (
          <Svg
            width={layout.width}
            height={layout.height}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <Filter id="invert">
                <FeColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values="-1.1 0 0 0 1
                          0 -1.2 -0.4 0.1 1
                          -0.3 0 -1.4 0.1 1 
                          -0.2 -0.6 0 0.8 0"
                />
              </Filter>
            </Defs>
            <SvgImage
              x="0"
              y="0"
              width={layout.width}
              height={layout.height}
              preserveAspectRatio="none"
              href={source}
              filter="url(#invert)"
            />
          </Svg>
        ) : (
          // Render a placeholder or the original image while waiting for layout
          // Using original image ensures something is visible immediately
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit={contentFit}
            cachePolicy={cachePolicy}
          />
        )}
      </View>
    );
  }

  // Fallback: regular image (when not in dark mode)
  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      cachePolicy={cachePolicy}
    />
  );
});

// Component to render a single page with optional highlighter
const PageItem = React.memo(({
  item,
  index,
  isLandscape,
  screenWidth,
  rowHighlighterEnabled,
  currentRow,
  isDarkMode
}: {
  item: typeof PAGES[0],
  index: number,
  isLandscape: boolean,
  screenWidth: number,
  rowHighlighterEnabled: boolean,
  currentRow: number,
  isDarkMode: boolean
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Animation value for current row (0-14)
  const rowProgress = useSharedValue(currentRow);

  // Update shared value when currentRow changes
  useEffect(() => {
    rowProgress.value = withTiming(currentRow, { duration: 300 });
  }, [currentRow]);

  // Animated style for the highlight overlay
  const highlightStyle = useAnimatedStyle(() => {
    return {
      top: `${(rowProgress.value / 15) * 100}%`,
      height: `${100 / 15}%`
    };
  });

  // Scroll to center the current row in landscape mode
  useEffect(() => {
    if (isLandscape && rowHighlighterEnabled && scrollViewRef.current && imageHeight > 0 && containerHeight > 0) {
      const rowHeight = imageHeight / 15;

      // Calculate target to center the row
      // Row center relative to image top
      const rowCenterY = (currentRow * rowHeight) + (rowHeight / 2);

      // We want this rowCenterY to be at containerHeight / 2
      // So we scroll such that scrollTop + (containerHeight / 2) = rowCenterY
      // scrollTop = rowCenterY - (containerHeight / 2)

      const targetY = rowCenterY - (containerHeight / 2);

      // Clamp the scroll position
      // Min: 0
      // Max: ContentHeight - ContainerHeight = imageHeight - containerHeight
      const maxScrollY = Math.max(0, imageHeight - containerHeight);
      const clampedY = Math.max(0, Math.min(maxScrollY, targetY));

      scrollViewRef.current.scrollTo({ y: clampedY, animated: true });
    }
  }, [isLandscape, rowHighlighterEnabled, currentRow, imageHeight, containerHeight]);

  const onImageLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setImageHeight(height);
  };

  const onContainerLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  };

  if (isLandscape) {
    const horizontalPadding = 60;
    return (
      <View
        style={[styles.pageContainer, { width: screenWidth, paddingHorizontal: horizontalPadding }]}
        onLayout={onContainerLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.pageScrollView}
          showsVerticalScrollIndicator={false}
          bounces={!rowHighlighterEnabled}
          scrollEnabled={!rowHighlighterEnabled}
        >
          <View onLayout={onImageLayout}>
            <InvertedImage
              source={item.source}
              style={styles.landscapeImage}
              contentFit="fill"
              cachePolicy="memory-disk"
              isDarkMode={isDarkMode}
            />
            {rowHighlighterEnabled && (
              <Animated.View style={[
                styles.highlightOverlay,
                highlightStyle,
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 255, 0, 0.15)' }
              ]} />
            )}
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={[styles.pageContainer, { width: screenWidth }]}>
        <View style={{ width: '100%', height: '100%' }}>
          <InvertedImage
            source={item.source}
            style={styles.pageImage}
            contentFit="fill"
            cachePolicy="memory-disk"
            isDarkMode={isDarkMode}
          />
          {rowHighlighterEnabled && (
            <Animated.View style={[
              styles.highlightOverlay,
              highlightStyle,
              { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 255, 0, 0.15)' }
            ]} />
          )}
        </View>
      </View>
    );
  }
});

export default function ReaderScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { page, bookmarkId } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSurahs, setCurrentSurahs] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState(0); // 0-14
  const [rowHighlighterEnabled, setRowHighlighterEnabled] = useState(false);
  const dimensions = Dimensions.get('window');
  const [screenWidth, setScreenWidth] = useState(dimensions.width);
  const [isLandscape, setIsLandscape] = useState(dimensions.width > dimensions.height);
  const sessionStartedRef = useRef(false);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionStartPageRef = useRef<number | null>(null);
  const latestPageRef = useRef<number | null>(null);
  const currentRowRef = useRef(currentRow);
  const currentSurahsRef = useRef(currentSurahs);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentRowRef.current = currentRow;
  }, [currentRow]);

  useEffect(() => {
    currentSurahsRef.current = currentSurahs;
  }, [currentSurahs]);

  // Load settings
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const stored = await AsyncStorage.getItem(SETTINGS_KEY);
          if (stored !== null) {
            setRowHighlighterEnabled(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Error loading settings in Reader:', error);
        }
      };
      loadSettings();
    }, [])
  );

  const persistSession = useCallback(async () => {
    if (sessionStartTimeRef.current === null || sessionStartPageRef.current === null || latestPageRef.current === null) {
      return;
    }

    const endPage = latestPageRef.current;

    // Calculate elapsed time for this reading session
    const elapsedMs = Date.now() - sessionStartTimeRef.current;
    const elapsedMinutes = elapsedMs / 60000;

    // If user hasn't read for at least 5 seconds, don't persist anything to AsyncStorage
    if (elapsedMs < 5000) {
      return;
    }

    const durationMinutes = Math.max(1, Math.round(elapsedMinutes));

    const pagesRead = Math.max(0, Math.abs(endPage - sessionStartPageRef.current));
    const surahs = getSurahsOnPage(endPage);
    const surahName = surahs.length > 0 ? surahs[0].englishName : 'Unknown';
    const formatDate = () => {
      const now = new Date();
      const months = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];
      return `${now.getDate()} ${t(months[now.getMonth()])}`;
    };

    const sessionDate = formatDate();
    const sessionTime = formatTime();

    const lastReadPayload = {
      sura: surahName,
      page: latestPageRef.current,
      date: sessionDate,
      time: sessionTime,
      timestamp: Date.now(),
      duration: `${durationMinutes} ${t('minutes')}`,
      durationMinutes: durationMinutes,
      pages: pagesRead,
      row: currentRowRef.current,
      surahs: currentSurahsRef.current,
    };
    try {
      await AsyncStorage.setItem('lastRead', JSON.stringify(lastReadPayload));

      if (bookmarkId && typeof bookmarkId === 'string') {
        const stored = await AsyncStorage.getItem('bookmarks');
        if (stored) {
          const parsed: Bookmark[] = JSON.parse(stored);
          const updated = parsed.map((bookmark) =>
            bookmark.id === bookmarkId
              ? {
                ...bookmark,
                page: latestPageRef.current,
                row: currentRowRef.current, // Use ref
                sura: surahName, // Keep sura for backward compatibility if needed, or remove if surahs array is preferred
                date: sessionDate,
                time: sessionTime,
                timestamp: Date.now(),
              }
              : bookmark
          );
          await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
        }
      }
    } catch (error) {
      console.error('Error saving reading session:', error);
    }
  }, [bookmarkId]); // Removed currentRow and currentSurahs dependencies

  const schedulePersist = useCallback(() => {
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      persistSession();
    }, 200);
  }, [persistSession]);

  const updateSessionProgress = useCallback((pageNumber: number) => {
    if (!sessionStartedRef.current) {
      sessionStartPageRef.current = pageNumber;
      sessionStartTimeRef.current = Date.now();
      sessionStartedRef.current = true;
    }

    // Track the last visible page (not just the max) so backward reading counts
    latestPageRef.current = pageNumber;

    schedulePersist();
  }, [schedulePersist]);

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Store the current page before updating width
      const currentPageBeforeResize = currentPage;
      setScreenWidth(window.width);
      setIsLandscape(window.width > window.height);

      // After width changes, scroll back to the current page
      setTimeout(() => {
        if (flatListRef.current && currentPageBeforeResize >= 0) {
          flatListRef.current.scrollToIndex({
            index: currentPageBeforeResize,
            animated: false
          });
        }
      }, 100);

      // Reset row if needed or keep it? 
      // User didn't specify, but keeping it seems safe.
    });

    return () => {
      subscription?.remove();
    };
  }, [currentPage]);

  // Gesture Handler
  const handleRowChange = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      // Moving highlight DOWN (reading forward)
      if (currentRow < 14) {
        setCurrentRow(prev => prev + 1);
      } else {
        // Next page
        if (currentPage < PAGES.length - 1) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          setCurrentRow(0);
          flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
        }
      }
    } else {
      // Moving highlight UP (reading backward)
      if (currentRow > 0) {
        setCurrentRow(prev => prev - 1);
      } else {
        // Previous page
        if (currentPage > 0) {
          const prevPage = currentPage - 1;
          setCurrentPage(prevPage);
          setCurrentRow(14); // Go to last row of previous page
          flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
        }
      }
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(rowHighlighterEnabled)
    .runOnJS(true)
    .onEnd((e) => {
      if (!rowHighlighterEnabled) return;

      const { translationY } = e;
      const threshold = 30; // Sensitivity

      if (translationY < -threshold) {
        // Swipe UP -> Move Highlight DOWN (Next Row)
        // Wait, standard scroll logic: Swipe UP (finger moves up) -> Content moves UP -> View moves DOWN.
        // But user said: "Each swipe down should select the row below".
        // Swipe DOWN (finger moves down, translationY > 0) -> Select Row Below (Next Row).
        // Swipe UP (finger moves up, translationY < 0) -> Select Row Above (Prev Row).

        // Let's stick to user's explicit instruction: "Each swipe down should select the row below"
        // Swipe Down -> translationY > 0
        handleRowChange('up'); // Moving highlight UP (visually up, index decreases)
      } else if (translationY > threshold) {
        // Swipe DOWN -> Select Row Below (Next Row)
        handleRowChange('down'); // Moving highlight DOWN (visually down, index increases)
      }
    });

  useFocusEffect(
    useCallback(() => {
      // When leaving the reader (blur), persist any progress immediately
      return () => {
        persistSession();
      };
    }, [persistSession])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextStatus => {
      if (appState.current === 'active' && nextStatus.match(/inactive|background/)) {
        persistSession();
      }
      appState.current = nextStatus;
    });

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      subscription.remove();
      persistSession();
    };
  }, [persistSession]);

  useEffect(() => {
    // If a page number is provided, try to scroll to it
    // Page numbers are 1-based, but array indices are 0-based
    if (page && typeof page === 'string') {
      const pageNum = parseInt(page, 10);
      const pageIndex = pageNum - 1; // Convert 1-based to 0-based
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < PAGES.length) {
        setCurrentPage(pageIndex);

        // Restore row if provided in params (e.g. from bookmark)
        // We need to check if 'row' param exists in useLocalSearchParams, 
        // but currently we only get page and bookmarkId.
        // Wait, if we are loading a bookmark, we should load the row from the bookmark data.
        // But here we only have page number. 
        // Let's check if we can get the row from the bookmark itself if bookmarkId is present.

        // Actually, the best place to restore row is probably where we load the bookmark or last session.
        // But this useEffect runs when 'page' param changes.

        // Let's try to get the row from the bookmark if bookmarkId is present
        const restoreRow = async () => {
          if (bookmarkId) {
            try {
              const storedBookmarks = await AsyncStorage.getItem('bookmarks');
              if (storedBookmarks) {
                const bookmarks: Bookmark[] = JSON.parse(storedBookmarks);
                const bookmark = bookmarks.find(b => b.id === bookmarkId);
                if (bookmark && bookmark.row !== undefined) {
                  setCurrentRow(bookmark.row);
                } else {
                  setCurrentRow(0);
                }
              }
            } catch (e) {
              console.error("Error loading bookmark row", e);
              setCurrentRow(0);
            }
          } else {
            // If just opening a page (not bookmark), maybe from last session?
            // But this block is for when 'page' param is provided.
            // If 'page' param is provided, it might be from a deep link or navigation.
            // If it's from "Last Read", the caller should pass the row?
            // Or we can load lastRead here if no bookmarkId?

            // Let's assume if no bookmarkId, we default to 0, UNLESS we are loading the app initial state.
            // But this useEffect runs on mount too if page is provided.

            // If we want to restore last session row, we need to read it.
            // Let's do a quick check for lastRead if no bookmarkId
            try {
              const lastRead = await AsyncStorage.getItem('lastRead');
              if (lastRead) {
                const parsed = JSON.parse(lastRead);
                // Only restore if the page matches
                if (parsed.page === parseInt(page as string, 10)) {
                  setCurrentRow(parsed.row || 0);
                } else {
                  setCurrentRow(0);
                }
              }
            } catch (e) {
              setCurrentRow(0);
            }
          }
        };
        restoreRow();

        // Set initial Surahs
        const surahs = getSurahsOnPage(pageNum);
        const surahNames = surahs.map(s => {
          if (i18n.language === 'sq') return s.albanianName;
          if (i18n.language === 'tr') return s.turkishName;
          return s.englishName;
        });
        setCurrentSurahs(surahNames);
        updateSessionProgress(pageNum);

        // Small delay to ensure FlatList is ready
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: pageIndex, animated: false });
        }, 100);
      }
    } else {
      // Default to page 1
      // Try to load last session if no page param
      const loadLastSession = async () => {
        try {
          const lastRead = await AsyncStorage.getItem('lastRead');
          if (lastRead) {
            const parsed = JSON.parse(lastRead);
            if (parsed.page && parsed.page > 0) {
              // We should probably navigate to this page?
              // But if we are here, 'page' param was null.
              // Usually the home screen handles checking lastRead and passing the page param.
              // If we are here without page param, it means we just opened Reader directly?
              // Or maybe we should just set the row if we happen to be on the right page?
              // But default is Page 1.
              if (parsed.page === 1) {
                setCurrentRow(parsed.row || 0);
              }
            }
          }
        } catch (e) {
          console.error("Error loading last session", e);
        }
      };
      loadLastSession();

      const surahs = getSurahsOnPage(1);
      const surahNames = surahs.map(s => {
        if (i18n.language === 'sq') return s.albanianName;
        if (i18n.language === 'tr') return s.turkishName;
        return s.englishName;
      });
      setCurrentSurahs(surahNames);
      updateSessionProgress(1);
    }
  }, [page, updateSessionProgress]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const pageIndex = viewableItems[0].index || 0;
      setCurrentPage(pageIndex);

      // Update current Surahs based on page number (convert index to page number)
      const pageNumber = pageIndex + 1;
      const surahs = getSurahsOnPage(pageNumber);
      const surahNames = surahs.map(s => {
        if (i18n.language === 'sq') return s.albanianName;
        if (i18n.language === 'tr') return s.turkishName;
        return s.englishName;
      });
      setCurrentSurahs(surahNames);
      updateSessionProgress(pageNumber);
    }
  }, [updateSessionProgress]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // RTL: Going to next page means increasing index (swipe left)
  const goToNextPage = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  };

  // RTL: Going to previous page means decreasing index (swipe right)
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({ index: currentPage - 1, animated: true });
    }
  };

  const renderPage = useCallback(({ item, index }: { item: typeof PAGES[0]; index: number }) => {
    return (
      <PageItem
        item={item}
        index={index}
        isLandscape={isLandscape}
        screenWidth={screenWidth}
        rowHighlighterEnabled={rowHighlighterEnabled}
        currentRow={currentRow}
        isDarkMode={isDarkMode}
      />
    );
  }, [screenWidth, isLandscape, rowHighlighterEnabled, currentRow, isDarkMode]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fdf9de' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? theme.background : '#fdf9de'} />

      {/* Always visible top toolbar */}
      <SafeAreaView style={[styles.topControls, { backgroundColor: isDarkMode ? theme.background : '#fdf9de' }]} edges={['top']}>
        {/* Left: Home Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.homeButton}>
          <Ionicons name="home" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Center: Page Indicator with Navigation Arrows */}
        <View style={[styles.centerContainer, { paddingTop: insets.top + 8 }]}>
          {/* Left Navigation Arrow (Next Page in RTL/Reading Flow) */}
          <TouchableOpacity 
            onPress={goToNextPage} 
            style={styles.centerNavButton} 
            disabled={currentPage === PAGES.length - 1}
          >
            <Ionicons 
              name="chevron-back" 
              size={32} 
              color={currentPage === PAGES.length - 1 ? theme.border : theme.text} 
            />
          </TouchableOpacity>

          {/* Center Content */}
          <View style={styles.pageIndicatorContainer} pointerEvents="none">
            {currentSurahs.length > 0 && (
              <Text style={[styles.surahIndicator, { color: theme.text }]}>
                {currentSurahs.join(', ')}
              </Text>
            )}
            <View style={styles.pageIndicatorRow}>
              <Text style={[styles.pageIndicator, { color: theme.secondaryText }]}>
                {t('page')}: {currentPage + 1}
              </Text>

            </View>
          </View>

          {/* Right Navigation Arrow (Previous Page in RTL/Reading Flow) */}
          <TouchableOpacity 
            onPress={goToPreviousPage} 
            style={styles.centerNavButton} 
            disabled={currentPage === 0}
          >
            <Ionicons 
              name="chevron-forward" 
              size={32} 
              color={currentPage === 0 ? theme.border : theme.text} 
            />
          </TouchableOpacity>
        </View>
        {SAJDAH_PAGES.includes(currentPage + 1) && (
                <View style={styles.sajdahBadge}>
                  <Ionicons name="star" size={14} color="#ffae00" />
                  <Text style={styles.sajdahText}>{t('sajdah')}</Text>
                </View>
              )}
      </SafeAreaView>

      <SafeAreaView
        style={[styles.contentContainer, { backgroundColor: isDarkMode ? theme.background : '#fdf9de' }]}
        edges={['bottom']}
      >
        <GestureDetector gesture={panGesture}>
          <FlatList
            key={`flatlist-${screenWidth}`}
            ref={flatListRef}
            data={PAGES}
            renderItem={renderPage}
            horizontal
            inverted
            pagingEnabled={!rowHighlighterEnabled} // Disable paging snap if highlighter is on? Or just disable scroll?
            scrollEnabled={!rowHighlighterEnabled} // Disable scroll if highlighter is on
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.name}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            initialScrollIndex={page ? Math.max(0, parseInt(page as string, 10) - 1) : 0}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
            initialNumToRender={2}
            snapToInterval={screenWidth}
            snapToAlignment="start"
            decelerationRate="fast"
          />
        </GestureDetector>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf9de',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fdf9de',
  },
  navButtonTop: {
    paddingHorizontal: 8,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure clickable above absolute center
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 0,
    // Padding top handled dynamically via insets
    paddingBottom: 12, // Match topControls padding
    paddingHorizontal: 50, // Avoid home button
  },
  centerNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 28,
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surahIndicator: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pageIndicator: {
    color: '#000',
    fontSize: 14,
    opacity: 0.8,
  },
  sajdahBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sajdahText: {
    color: '#ffa200',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fdf9de',
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageScrollView: {
    flex: 1,
    width: '100%',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  landscapeImage: {
    width: '100%',
    aspectRatio: 0.7, // Quran page aspect ratio (width/height)
  },
  highlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    zIndex: 10,
    borderRadius: 4, // Optional: adds a bit of roundness
  },
});
