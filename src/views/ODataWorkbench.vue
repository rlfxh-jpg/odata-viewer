<template>
  <section class="workbench">
    <el-tabs v-model="pageTab" class="page-tabs">
      <el-tab-pane label="Connect & Import" name="connect">
        <el-card shadow="never" class="connect-card">
      <div class="connect-row">
        <el-input
          v-model="metadataUrl"
          placeholder="闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾剧懓顪冪€ｎ亝鎹ｉ柣顓炴閵嗘帒顫濋敐鍛婵°倗濮烽崑鐐烘偋閻樻眹鈧線寮村杈┬㈤梻浣规偠閸庢椽宕滈敃鍌氭瀬鐎广儱顦伴悡鐔兼煙闁箑骞楃紓宥嗗灥闇夋繝濠傛閸濊櫣绱掔紒妯肩疄闁诡喕绮欏Λ鍐归煬鎻掔仾缂佺粯绋撴禒锕傚磼濮橈絽浜炬俊銈呭暙閸ㄦ繄绱撴担濮戭亪顢氶柆宥嗗€垫繛鎴炵懐閻掍粙鏌涘Ο鍏兼毈婵﹤顭峰畷鎺戭潩椤戣棄浜鹃柟闂寸贰閺佸銇勯幘顖涘殟闁搞儺鍓氶弲婵嬫煕鐏炲墽銆掗柛?OData Metadata URL闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻锝夊箣閿濆憛鎾绘煕婵犲倹鍋ラ柡灞诲姂瀵噣宕奸悢鍛婎唶闂備胶顭堥鍡涘箰閸撗冨灊妞ゆ挾鍋愬Σ鍫熶繆椤栨繍鍤欐繛鍛囧洦鈷戞繛鑼额嚙楠炴鏌ｉ悢鍙夋珚鐎殿喖顭烽幃銏㈡偘閳ュ厖澹曢梺姹囧灪椤旀牠鎮為幆顬″綊鎮╁▎蹇斿闁抽攱甯￠弻娑㈠即閵娿儰绨诲銈呮禋閸欏啴寮婚垾宕囨殕閻庯綆鍓涢惁鍫ユ倵鐟欏嫭绀冮柨鏇樺灪娣囧﹪骞栨担鑲濄劑鏌曡箛鏇炐″瑙勬礋閹嘲顭ㄩ崨顓ф毉闁汇埄鍨弲鐘差嚕椤愶箑绀冩い顓烆儏缂嶅﹪骞冮埡渚囧晠妞ゆ梻鍘ф竟澶愭⒒娴ｈ櫣甯涢柟绋挎憸閹广垽骞囬幍鏂ュ亾閿曞倸閿ゆ俊銈勭濞堟繈姊哄Ч鍥х伄闁稿缍侀崺鈧い鎺嶇缁椦呯磼鏉堛劌绗氭繛鐓庣箻婵℃悂濡烽绛嬫缂?https://host/odata/$metadata"
          @keyup.enter="handleConnectByUrl"
        >
          <template #append>
            <el-button :loading="connecting" type="primary" @click="handleConnectByUrl">Connect</el-button>
          </template>
        </el-input>
        <el-button @click="loadSampleMetadata">Load Sample Metadata</el-button>
      </div>

      <div class="connect-row secondary-row">
        <el-select
          v-model="selectedHistoryUrl"
          placeholder="Recent connections"
          clearable
          class="history-select"
          @change="handlePickHistory"
        >
          <el-option v-for="item in historyUrls" :key="item" :value="item" :label="item" />
        </el-select>

        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".xml,text/xml,application/xml"
          :before-upload="handleBeforeUpload"
          class="upload-box"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闂囧鏌ㄥ┑鍡欏妞ゅ繒濮风槐鎺楀焵椤掍胶绡€闁稿本顨嗛弬鈧梻浣虹帛閿氱€殿喖鐖奸獮鏍箛椤斿墽锛濇繛杈剧到瀵泛鈻嶆繝鍐╁弿濠电姴鍟妵婵囥亜閵忊槅娈滈柛鈹惧亾濡炪倖甯掗崐濠氭儗閹剧粯鐓熼柕蹇嬪焺閻掑墽鐥幆褜鐓奸柟顔筋殜閺佹劖鎯旈垾鑼殫缂傚倷娴囬褍螞濠靛钃熼柡鍥ュ灩闁卞洦绻濋棃娑欐悙婵炲拑缍佸娲传閸曨剦妫為梺鎸庢处娴滎亜顕?XML 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎悗骞垮劚椤︻垳绮堢€ｎ偁浜滈柟鍝勭Ф閸斿秵銇勯弬鎸庡缂佺粯绻傞銉╂煥鐎ｎ偆鍑￠梺閫炲苯澧柟绋垮⒔閸掓帡宕奸悢铏规嚌闂侀€炲苯澧柣锝囨焿閵囨劙骞掗幋鐘垫綁闂備礁澹婇崑鍡涘窗閹捐鍌ㄥù鐘差儐閳锋垿鏌熺粙鎸庢崳缂佺姵鎹囬弻鐔煎礃閼碱剛顔囬梺鎸庢磸閸ㄤ粙鐛澶樻晩闁荤喖顣︽竟鏇㈡煟閻斿摜鎳冮悗姘煎幘缁牓宕橀鐣屽幗闂佺懓鐏濈€氼喚寮ч埀顒勬倵濞堝灝鏋涙い顓犲厴瀹曡銈ｉ崘銊х杸婵炶揪绲介幉锟犲磹椤栫偞鈷戠痪顓炴噹娴滃綊鎮跺☉鏍у姦闁糕斁鍋撳銈嗗坊閸嬫挾鐥紒銏犲籍妞ゃ垺鐟╅獮瀣晜鐟欙絾瀚藉┑鐐舵彧缂嶁偓婵炲拑绲块弫顔尖槈閵忥紕鍘甸梺鍛婄☉閿曘儵宕愰幇顔瑰亾鐟欏嫭绀冮柛鏃€鐗滈幑銏犫攽閸♀晜鍍靛銈嗗笒閸婂憡鎱ㄩ敂鎴掔箚闁绘劦浜滈埀顒佺墪椤斿繑绻濆顒傦紱闂佺懓澧界划顖炴偂閺囩喍绻嗘い鏍ㄧ箓閸氬綊鏌ｉ鐔风闁逞屽墲椤煤濮椻偓瀹曞綊宕稿Δ鍐ㄧウ濠碘槅鍨甸崑鎰閸忛棿绻嗘い鏍ㄧ缚閳ь兘鍋撻梺绋款儐閹瑰洭骞冩禒瀣窛濠电姴瀚铏節閻㈤潧鈻堟繛浣冲吘娑樷攽鐎ｅ灚鏅涘┑掳鍊愰崑鎾淬亜椤撯€冲姷妞わ附娼欓…鑳槼妞ゃ劌锕ユ穱濠囨偨缁嬭法顦板銈嗙墬缁嬫帒鈻嶉崱娑欑厽闁绘ê寮堕幖鎰偓娈垮枛閻栧ジ骞冮棃娑掓斀闁糕€崇箲閺傗偓婵＄偑鍊栧濠氬Υ鐎ｎ喖缁╃紓浣姑肩换鍡涙煟閹邦厼顥嬮柣顓熺懄椤ㄣ儵鎮欓幓鎺撴闂佽鍠楃划鎾诲箰婵犲啫绶炵€光偓婵犲倹鍊繝纰夌磿閸嬫垿宕愰弽顬稒鎷呯憴鍕伎闂侀潧鐗嗛ˇ顖滅玻濡ゅ懏鐓涚€广儱楠搁獮妤呮煃闁垮绗掗棁澶愭煥濠靛棛澧涙い蹇曞█閹粙顢涘☉姘ｅ闂侀潧娲ょ€氱増淇婇幖浣肝ㄩ柨鏃傜帛閿熴儵姊绘担鍛婂暈閻㈩垱顨堥弫顕€鏁撻悩闈涚ウ濠碘槅鍨靛▍锝夊汲閿曞倹鐓曢柕澶涚到婵¤姤銇勯弮鈧ú鐔奉潖缂佹ɑ濯村〒姘煎灡閺侇垶姊虹憴鍕仧濞存粠浜滈～蹇旂鐎ｎ亞顦板銈嗙墬濮樸劑寮昏濮婃椽宕烽鐘茬闁汇埄鍨弲鐘诲箖閵忋倕骞㈡繛鎴炵懃娴狀垶姊洪幆褏绠抽柟铏崌閹啴骞嬮敂鐣屽幈闂佸搫鍟崐鎼佸几閹达附鐓忛柛銉戝喚浼冮梺杞扮閸婂骞夐幘顔肩妞ゆ帒鍊哥紞鍐⒒閸屾瑧顦﹂柟纰卞亰閹本寰勫畝鈧粈濠傘€掑锝呬壕濡ょ姷鍋涢崯鎾春閿熺姴宸濇い鎾跺Х閸橆剙鈹戦悩顔肩伇婵炲鐩、鏍幢濞戞锛欓梻浣哥仢椤戝洨寮ч埀顒傜磼閸撗冾暭閽冭鲸銇勯顫含闁哄本鐩俊鎼佸Χ閸涱厾銈梻浣芥〃缁€渚€宕幘顔衡偓渚€寮崼婵堫槹濡炪倖鎸鹃崰鎰邦敊閺囥垺鈷掑ù锝呮贡濠€浠嬫煕閵娿儺鐓奸柍銉畵瀹曠厧鈹戦崶鈺佸毐婵犵數濮烽弫鍛婃叏娴兼潙鍨傞柣鎾崇岸閺嬫牗绻涢幋娆忕労闁轰礁瀚伴弻娑㈠Ψ椤旂厧顫╅梺绋胯閸旀垵顫忓ú顏嶆晢闁逞屽墰缁棃鎮介弶鍡楊槹缁绘繈宕橀敂璺ㄧ泿闂備浇顫夋竟瀣疾濞戙垺鍊舵い蹇撶墛閻撴瑩鏌涜箛鏇炲付濠殿喖鐗撻弻鏇㈠炊瑜嶉顓燁殽閻愬樊鍎忛柍瑙勫灴瀹曟儼顦抽柣锝咁煼閺岋絾鎯旈妶搴㈢秷濠电偛寮堕…鍥箲閵忋倕纾奸柣鎰ㄦ杹閸嬫捇鏁冮崒姣尖晠鏌嶆潪鎷屽厡妞わ附婢橀—鍐Χ閸℃ê鏆楁繝娈垮枛閸㈡彃宓勯梺鎼炲労閸撴岸鍩涢幒鎴欌偓鎺戭潩閿濆懍澹曢梻渚€鈧偛鑻晶浼存煕鐎ｎ偆娲撮柟宕囧枛椤㈡稑鈽夊▎鎰娇婵＄偑鍊栭悧婊堝磻閻愬搫纾归柣銏犳啞閳锋帡鏌涢銈呮灁闁崇鍊濋弻娑氣偓锝冨妼閻忣噣鏌嶈閸撴岸顢欓弽顓炵獥闁哄稁鍘介崑澶娾攽閸屾碍鎲哥€规挷绶氶幃妤呮晲鎼粹剝鐏嶉梺绋匡功閸忔﹢寮婚妶鍥ф瀳闁告鍋涢獮宥夋⒑?Metadata</div>
        </el-upload>
      </div>
    </el-card>
      </el-tab-pane>
      <el-tab-pane label="Schema Explorer" name="explorer">

    <div class="workspace" :style="workspaceStyle">
      <el-card class="sidebar-card" shadow="never">
        <template #header>
          <div class="card-title">Schema Explorer</div>
        </template>
        <el-tree
          ref="treeRef"
          node-key="key"
          :data="treeData"
          :current-node-key="selectedNodeKey"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="schema-tree-node">
              <span class="schema-tree-node-label">{{ data.label }}</span>
              <el-tag v-if="isAbstractEntityTypeNode(data)" size="small" type="warning" effect="plain">
                Abstract
              </el-tag>
            </div>
          </template>
        </el-tree>
      </el-card>

      <div
        class="sidebar-resizer"
        :class="{ active: isSidebarResizing }"
        @mousedown.prevent="startSidebarResize"
      />

      <div class="viewer-area">
        <el-card shadow="never" class="viewer-card">
          <template #header>
            <div class="viewer-header">
              <div>
                <div class="card-title">Viewer</div>
                <div class="sub-title">{{ detailSubtitle }}</div>
              </div>
              <div class="header-actions">
                <el-tooltip :content="erButtonTooltip" placement="top">
                  <span>
                    <el-button :disabled="!canOpenErDialog" type="primary" plain @click="openErDialog">
                      ER 闂?                    </el-button>
                  </span>
                </el-tooltip>
                <el-button :disabled="!selectedLeafNode" plain @click="openRawDialog">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON</el-button>
                <el-tooltip :content="inheritanceTooltip" placement="top">
                  <span>
                    <el-button :disabled="!canOpenInheritance" plain @click="openInheritanceDialog">
                      缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閹冣挃闁硅櫕鎹囬垾鏃堝礃椤忎礁浜鹃柨婵嗙凹缁ㄥジ鏌熼惂鍝ユ偧缂佽鲸甯￠崺鈧い鎺嶈兌缁♀偓闂佹悶鍎崝搴ㄥ储閹剧粯鍋℃繝濠傚閻帞鈧娲樼划鎾诲箖閵忋倖鍋傞幖娣€栭幉鐗堢節閻㈤潧浠﹂柛顭戝灦瀹曠銇愰幒鎴狀攨闂佽鍎兼慨銈夋偂韫囨挴鏀介柣鎰皺娴犮垽鏌涢弮鈧悷鈺呭蓟閵堝绀堥棅顐幘閻╁酣姊虹€圭媭娼愰柛銊ユ健瀹曟椽濡烽埡浣歌€垮┑锛勫仦閸庢娊藟濮樿京纾介柛灞剧懆閸忓瞼绱掗鍛仯闁瑰箍鍨藉畷鎺楁倻閸モ晝鈼ら梻濠庡亜濞诧妇绮欓幒妤€绠氶柣鎰劋閻撴洟鏌ㄩ弮鍥跺殭妤犵偞锕㈤弻锝夊箻鐎涙ê纾抽梺鍝勭焿缂嶄線骞冮埡鍛闁告稒婢橀悞濠氭⒒娴ｅ憡鍟為柡灞诲姂閺屽﹪鏁愭径鍫氬亾娴ｇ硶鏋庨柟鎯х－閸婄偤姊洪崘鍙夋儓闁哥喍鍗抽弫宥咁煥閸啿鎷洪梺鍛婄☉閿曘儳鈧灚鐟╅弻娑㈠焺閸愬じ绶甸梺閫炲苯澧い銊ワ工椤繐煤椤忓嫬绐涙繝鐢靛Т鐎氼參宕宠濮婃椽宕妷銉︾€惧┑鐐插悑閻熲晠銆?                    </el-button>
                  </span>
                </el-tooltip>
              </div>
            </div>
          </template>

          <el-empty v-if="!selectedLeafNode" description="Please select a node from the left tree" />

          <template v-else>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Fields" name="table">
                <el-card v-if="selectedEntityTypeForDetails" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">EntityType Config</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedEntityTypeForDetails.name }}</el-descriptions-item>
                    <el-descriptions-item label="Abstract">
                      {{ selectedEntityTypeForDetails.abstract ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="BaseType">
                      {{ selectedEntityTypeForDetails.baseTypeFullName || selectedEntityTypeForDetails.baseType || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Keys">
                      {{ selectedEntityTypeForDetails.keyNames.join(', ') || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Entity Annotations" :span="2">
                      {{ annotationSummary(selectedEntityTypeForDetails.annotations, 5) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>

                <template v-if="propertyRows.length">
                  <el-table :data="propertyRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="170">
                      <template #default="{ row }">
                        <div class="field-name">
                          <el-tag v-if="isPrimaryKey(row.name)" type="warning" size="small">PK</el-tag>
                          {{ row.name }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="Type" min-width="180">
                      <template #default="{ row }">
                        {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="MaxLength" width="110">
                      <template #default="{ row }">
                        {{ row.maxLength || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
                <enum-type-detail v-else-if="selectedEnumTypeNode" :data="selectedEnumTypeNode" />
                <el-card v-else-if="selectedTermNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Term Config</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedTermNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">{{ formatTypeRef(selectedTermNode.type) }}</el-descriptions-item>
                    <el-descriptions-item label="Nullable">
                      <el-tag :type="selectedTermNode.nullable ? 'success' : 'danger'" size="small">
                        {{ selectedTermNode.nullable ? 'Yes' : 'No' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="DefaultValue">{{ selectedTermNode.defaultValue || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="BaseTerm">
                      {{ selectedTermNode.baseTermFullName || selectedTermNode.baseTerm || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="AppliesTo">
                      <template v-if="selectedTermNode.appliesTo?.length">
                        {{ selectedTermNode.appliesTo.join(', ') }}
                      </template>
                      <template v-else>-</template>
                    </el-descriptions-item>
                    <el-descriptions-item label="Config" :span="2">{{ termConfigSummary || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedTermNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <el-table
                    v-if="selectedTermNode.annotations.length"
                    :data="selectedTermNode.annotations"
                    border
                    stripe
                    class="sub-card"
                  >
                    <el-table-column prop="term" label="Term" min-width="220" />
                    <el-table-column prop="qualifier" label="Qualifier" min-width="140" />
                    <el-table-column prop="value" label="Value" min-width="220" />
                  </el-table>
                </el-card>
                <el-card v-else-if="selectedOperationNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">{{ selectedOperationNode.kind === 'action' ? 'Action Config' : 'Function Config' }}</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedOperationNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">
                      {{ selectedOperationNode.kind === 'action' ? 'Action' : 'Function' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Signature" :span="2">
                      {{ selectedOperationNode.signature }}
                    </el-descriptions-item>
                    <el-descriptions-item label="IsBound">
                      {{ selectedOperationNode.isBound ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedOperationNode.kind === 'function'" label="IsComposable">
                      {{ selectedOperationNode.isComposable ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="EntitySetPath">
                      {{ selectedOperationNode.entitySetPath || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ReturnType">
                      {{ selectedOperationNode.returnType ? formatTypeRef(selectedOperationNode.returnType) : '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Return Nullable">
                      <template v-if="selectedOperationNode.returnType">
                        {{ selectedOperationNode.returnNullable ? 'Yes' : 'No' }}
                      </template>
                      <template v-else>-</template>
                    </el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedOperationNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <el-table v-if="selectedOperationNode.parameters.length" :data="selectedOperationNode.parameters" border stripe class="sub-card">
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Type" min-width="220">
                      <template #default="{ row }">
                        {{ formatTypeRef(row.type) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
                <el-card v-else-if="selectedOperationImportNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">
                      {{ selectedOperationImportNode.kind === 'actionImport' ? 'ActionImport Config' : 'FunctionImport Config' }}
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedOperationImportNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">
                      {{ selectedOperationImportNode.kind === 'actionImport' ? 'ActionImport' : 'FunctionImport' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Operation" :span="2">
                      <el-link type="primary" @click="jumpToOperationFromImport(selectedOperationImportNode)">
                        {{
                          selectedOperationImportNode.kind === 'actionImport'
                            ? selectedOperationImportNode.action
                            : selectedOperationImportNode.function
                        }}
                      </el-link>
                    </el-descriptions-item>
                    <el-descriptions-item label="EntitySet">
                      {{ selectedOperationImportNode.entitySet || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="IncludeInServiceDocument">
                      {{ selectedOperationImportNode.includeInServiceDocument ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedOperationImportNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>
                <el-empty v-else description="No fields available" />

                <el-card v-if="navigationRows.length" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Navigation Properties</div>
                  </template>
                  <el-table :data="navigationRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Target Type" min-width="220">
                      <template #default="{ row }">
                        <el-link type="primary" @click="jumpToNavigationTarget(row)">
                          {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                        </el-link>
                      </template>
                    </el-table-column>
                    <el-table-column prop="cardinality" label="Cardinality" width="120" />
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="partner" label="Partner" min-width="140" />
                    <el-table-column prop="onDelete" label="OnDelete" min-width="130" />
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>

              </el-tab-pane>

              <el-tab-pane label="TypeScript" name="ts">
                <div class="option-row">
                  <el-checkbox v-model="tsOptions.numberAsNumber">Edm.Int32 / Decimal 闂?number</el-checkbox>
                  <el-checkbox v-model="tsOptions.dateTimeOffsetAsString">Edm.DateTimeOffset 闂?string</el-checkbox>
                  <el-button type="primary" plain @click="copyTsCode">Copy</el-button>
                </div>
                <el-input :model-value="tsCode" type="textarea" :rows="16" readonly />
              </el-tab-pane>

              <el-tab-pane label="Query Tester" name="try">
                <template v-if="selectedEntitySetNode && selectedEntityTypeForTryIt">
                  <el-alert
                    v-if="!activeServiceRoot"
                    title="Current metadata was loaded from a local file. Connect by URL first to infer the service root."
                    type="warning"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />

                  <div class="try-grid">
                    <el-form label-position="top">
                      <el-form-item label="$select">
                        <el-select v-model="selectedFields" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="field in selectedEntityTypeForTryIt.properties"
                            :key="field.name"
                            :label="field.name"
                            :value="field.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$expand">
                        <el-select v-model="selectedExpands" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="nav in selectedEntityTypeForTryIt.navigationProperties"
                            :key="nav.name"
                            :label="nav.name"
                            :value="nav.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$filter">
                        <el-autocomplete
                          v-model="filterText"
                          :fetch-suggestions="queryFilterSuggestion"
                          clearable
                          placeholder="婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柛娑橈攻閸欏繘鏌ｉ幋锝嗩棄闁哄绶氶弻鐔兼⒒鐎靛壊妲紒鐐劤椤兘寮婚敐澶婄疀妞ゆ帊鐒﹂崕鎾剁磽娴ｅ搫校婵犮垺锕㈤崺鐐哄箣閿旇棄浜归悗瑙勬礀濞村倿寮抽敓鐘斥拺闁硅偐鍋涢埀顒佹礋閹崇喖顢涘┑鍫滅胺闂傚倷鐒︾€笛呮崲閸岀偛绠犻幖娣妼閸戠娀鏌曢崼婵愭Ч闁绘挻绋戦湁闁挎繂娴傞悞鐐亜韫囷絽寮柡宀嬬磿娴狅箓宕滆濡插牓姊虹€圭姵顥夋い锔诲灦閸┿垺鎯旈妸銉ь吅闂佺粯鍔栭幆宀勫船椤撱垺鈷?startswith(Name,'A') and IsDeleted eq false"
                        />
                      </el-form-item>

                      <el-form-item label="$top">
                        <el-input-number v-model="topValue" :min="1" :max="500" />
                      </el-form-item>
                    </el-form>

                    <div>
                      <el-form label-position="top">
                        <el-form-item label="闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧湱鈧懓瀚崳纾嬨亹閹烘垹鍊為悷婊冪箻瀵娊鏁冮崒娑氬幈濡炪値鍘介崹鍨濠靛鐓曟繛鍡楃箳缁犲鏌＄仦绋垮⒉鐎垫澘瀚埀顒婄秵娴滄繈顢欓崨顓涙斀闁绘劕寮堕埢鏇灻瑰鍐煟鐎殿噮鍋婂畷鍫曨敆娴ｅ搫甯鹃梻濠庡亜濞诧箑煤閺嵮勬瘎闂傚倷绀侀幉锛勬崲閸愵喓鈧啯绻濋崒銈嗙稁缂傚倷鐒﹂…鍥偡瑜版帗鐓曢柕澶嬪灥閸犳艾顭囬懡銈囩＝闁稿本鐟чˇ锔姐亜閿曞倷鎲剧€殿噮鍋嗛幏鐘绘嚑椤掍焦顔?URL">
                          <el-input :model-value="generatedTryItUrl" type="textarea" :rows="4" readonly />
                        </el-form-item>
                      </el-form>

                      <el-button type="primary" :loading="tryItLoading" @click="runTryIt">Run</el-button>
                    </div>
                  </div>

                  <el-divider />
                  <el-input
                    :model-value="tryItResponse"
                    type="textarea"
                    :rows="12"
                    readonly
                    placeholder="Response JSON will appear here after execution"
                  />
                </template>
                <el-empty v-else description="Try It supports EntitySet nodes only" />
              </el-tab-pane>
              <el-tab-pane label="OData Builder" name="builder">
                <template v-if="selectedEntityTypeForBuilder">
                  <el-alert
                    v-if="!activeServiceRoot"
                    title="Current metadata was loaded from a local file. Connect by URL first to infer the service root."
                    type="warning"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />
                  <el-alert
                    v-else-if="!selectedEntitySetForBuilder"
                    title="No EntitySet mapped for this EntityType. Type name is used as default path and can be edited."
                    type="info"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />

                  <div class="try-grid">
                    <el-form label-position="top">
                      <el-form-item label="Resource Path">
                        <el-input
                          v-model="builderResourcePath"
                          placeholder="濠电姷鏁告慨鐑藉极閸涘﹥鍙忛柣鎴ｆ閺嬩線鏌熼梻瀵割槮缁炬儳顭烽弻锝夊箛椤掍焦鍎撶紓浣哄У濠㈡﹢鍩為幋锔藉亹鐎规洖娴傞弳锟犳⒑閹肩偛鈧洟鎳熼婵堜簷闂備焦瀵х换鍌炲箠鎼淬劌鍑犻柕鍫濐槹閻撴稑霉閿濆浂鐒炬い蹇ｅ弮閺岋紕浠﹂崜褉妲堥梺瀹犳椤︻垶鍩㈡惔銊ョ闁绘劖鎯岄崬顓㈡⒒?Products 闂?Products('1001')"
                        />
                      </el-form-item>

                      <el-form-item label="$select">
                        <el-select v-model="builderSelectedFields" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="field in selectedEntityTypeForBuilder.properties"
                            :key="field.name"
                            :label="field.name"
                            :value="field.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$expand">
                        <el-select v-model="builderSelectedExpands" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="nav in selectedEntityTypeForBuilder.navigationProperties"
                            :key="nav.name"
                            :label="nav.name"
                            :value="nav.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$filter">
                        <el-autocomplete
                          v-model="builderFilterText"
                          :fetch-suggestions="queryBuilderFilterSuggestion"
                          clearable
                          placeholder="濠电姷鏁告慨鐑藉极閸涘﹥鍙忛柣鎴ｆ閺嬩線鏌熼梻瀵割槮缁炬儳顭烽弻锝夊箛椤掍焦鍎撶紓浣哄У濠㈡﹢鍩為幋锔藉亹鐎规洖娴傞弳锟犳⒑閹肩偛鈧洟鎳熼婵堜簷闂備焦瀵х换鍌炲箠鎼淬劌鍑犻柕鍫濐槹閻撴稑霉閿濆浂鐒炬い蹇ｅ弮閺岋紕浠﹂崜褉妲堥梺瀹犳椤︻垶鍩㈡惔銊ョ闁绘劖鎯岄崬顓㈡⒒?startswith(Name,'A') and IsDeleted eq false"
                        />
                      </el-form-item>

                      <el-form-item label="$orderby">
                        <el-input v-model="builderOrderByText" placeholder="濠电姷鏁告慨鐑藉极閸涘﹥鍙忛柣鎴ｆ閺嬩線鏌熼梻瀵割槮缁炬儳顭烽弻锝夊箛椤掍焦鍎撶紓浣哄У濠㈡﹢鍩為幋锔藉亹鐎规洖娴傞弳锟犳⒑閹肩偛鈧洟鎳熼婵堜簷闂備焦瀵х换鍌炲箠鎼淬劌鍑犻柕鍫濐槹閻撴稑霉閿濆浂鐒炬い蹇ｅ弮閺岋紕浠﹂崜褉妲堥梺瀹犳椤︻垶鍩㈡惔銊ョ闁绘劖鎯岄崬顓㈡⒒?Name desc" />
                      </el-form-item>

                      <div class="builder-inline-options">
                        <el-form-item label="$top">
                          <el-input-number v-model="builderTopValue" :min="1" :max="5000" />
                        </el-form-item>
                        <el-form-item label="$skip">
                          <el-input-number v-model="builderSkipValue" :min="0" :max="100000" />
                        </el-form-item>
                        <el-form-item label="$count">
                          <el-switch v-model="builderCountValue" />
                        </el-form-item>
                      </div>
                    </el-form>

                    <div>
                      <el-form label-position="top">
                        <el-form-item label="闂傚倸鍊搁崐鎼佸磹閹间礁纾圭€瑰嫭鍣磋ぐ鎺戠倞鐟滃繘寮抽敃鍌涚厱妞ゎ厽鍨垫禍婵嬫煕濞嗗繒绠婚柡灞稿墲瀵板嫮鈧綆浜濋鍛攽閻愬弶鈻曞ù婊冪埣瀵偊宕堕浣哄帾闂婎偄娲﹀ú鏍ф毄闂備礁鎲＄换鍐€冩繝鍌ゆ綎缂備焦顭囬悷褰掓煕閵夋垵鍠氬鑽ょ磽閸屾瑧顦︽い锕備憾瀵偆鎷犻懠顒佹?URL">
                          <el-input :model-value="generatedBuilderUrl" type="textarea" :rows="6" readonly />
                        </el-form-item>
                      </el-form>

                      <div class="builder-actions">
                        <el-button plain :disabled="!generatedBuilderUrl" @click="copyBuilderUrl">Copy URL</el-button>
                        <el-button
                          type="primary"
                          :loading="builderRequestLoading"
                          :disabled="!generatedBuilderUrl"
                          @click="runBuilderRequest"
                        >
                          闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴姘辩Т闂佹悶鍎洪崜锕傚极閸愵喗鐓ラ柡鍥殔娴滈箖姊哄Ч鍥р偓妤呭磻閹捐埖宕叉繝闈涙川缁♀偓闂佺鏈划宀勩€傞搹鍦＝濞达絾褰冩禍鐐節閵忥絾纭炬い鎴濇瀹曪綀绠涢弬鍓х畾闂佺粯鍔欓·鍌炲吹濞嗗緷鐟邦煥閸垻鏆┑?
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <el-divider />
                  <el-input
                    :model-value="builderResponseText"
                    type="textarea"
                    :rows="12"
                    readonly
                    placeholder="Response JSON will appear here after execution"
                  />
                </template>
                <el-empty v-else description="OData Builder supports only EntitySet / EntityType nodes" />
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-card>

      </div>
    </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="erDialogVisible"
      title="ER Diagram"
      width="92%"
      top="4vh"
      destroy-on-close
      class="er-diagram-dialog"
    >
      <div class="er-diagram-content">
        <div class="diagram-toolbar">
          <el-tag type="info" effect="plain">
            婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柛娑橈攻閸欏繘鏌ｉ幋锝嗩棄闁哄绶氶弻鐔兼⒒鐎靛壊妲紒鐐劤椤兘寮婚敐澶婄疀妞ゆ帊鐒﹂崕鎾绘⒑閹肩偛濡奸柛濠傛健瀵鈽夐姀鈺傛櫇闂佹寧绻傚Λ娑⑺囬妷褏纾藉ù锝呮惈瀛濈紓鍌氱Т閿曨亜顕ｇ拠宸悑濠㈣泛锕ｇ槐鍫曟⒑閸涘﹥澶勯柛鎾寸懃閳诲秹鏁愭径瀣ф嫼缂備礁顑堥崕濠氾綖閿曞倹鐓曢柡鍐ｅ亾闁搞劌鐏濋锝嗙節濮橆儵褔鏌涘銉モ偓鏇烇耿闁秴鐒垫い鎺戯功缁夌敻鏌涚€ｎ亝鍤囬柟顔炬暬瀵粙顢曢妶鍥风闯? {{ erCenterEntityType?.name || '-' }}
          </el-tag>
          <el-tag type="success" effect="plain">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻锝夊箣閿濆憛鎾绘煕閵堝懎顏柡灞剧洴椤㈡洟鏁愰崱娆欑穿闂備線鈧偛鑻晶鍓х磼閻樿櫕灏柣锝夋敱缁虹晫绮欏▎鐐秱闂備胶鍋ㄩ崕閬嶅疮鐠恒劏濮抽柕澶嗘櫆閳锋帒霉閿濆懏鎲哥紒澶嬫そ閺屾稓鈧綆浜烽煬顒傗偓瑙勬磻閸楀啿顕ｆ禒瀣垫晣闁告洦鍋掑Σ鍛娿亜椤愶絿绠炴い銏∶…銊╁焵椤掑倽濮冲┑鐘崇閳锋垿鎮峰▎蹇擃仼闁告柣鍊楅埀顒冾潐濞诧箓宕滈悢鐓庣畺婵せ鍋撴い銏℃瀹曞ジ鎮㈤崫鍕闂傚倷绀佸﹢閬嶅磿閵堝鈧啴宕奸妷锕€浠煎┑鐐叉▕娴滄繈鎮″☉姘ｅ亾閸忓浜鹃梺閫炲苯澧寸€规洑鍗抽獮姗€鎳滃▓鎸庣稐闂備礁婀遍崕銈夈€冮崨杈剧稏闁告稑鐡ㄩ悡鐔镐繆椤栨繃顏犻柨娑樼Т闇夋繝濠傜凹闁垱鎱? {{ centerRelationEdges.length }}</el-tag>
          <el-tag v-if="diagramOverflowCount > 0" type="warning" effect="plain">
            闂傚倸鍊搁崐鎼佸磹閹间礁纾圭€瑰嫭鍣磋ぐ鎺戠倞妞ゆ帒顦伴弲顏堟偡濠婂啴鍙勯柕鍡楀暣婵＄柉顦撮柣顓熺懇閺屾盯寮婚婊冣偓鎰板磻閹捐閿ゆ俊銈勮閹峰搫顪冮妶鍡楀潑闁稿鎸剧槐鎺撳緞濡儤鐝濋梺绯曟杹閸嬫挸顪冮妶鍡楃瑨闁挎洩绠撻幃楣冩偨绾版ê浜鹃悷娆忓缁€鍫ユ煕濡姴娲ら悡姗€鏌熸潏鍓х暠缂佺姵绋掗妵鍕箳瀹ュ洩绐楅梺鍛婄閻熲晛顫忔繝姘＜婵炲棙鍩堝Σ顔界節閵忋垺鍤€闁挎洦浜滈悾鐑藉箣閿曗偓瀹告繃銇勯幒鎴濇倯婵＄偠妫勯锝嗙鐎ｅ灚鏅ｉ梺缁樺姈瑜板啴骞愰妶澶嬧拻濞撴埃鍋撴繛浣冲泚鍥敃閿曗偓閻ょ偓绻濇繝鍌滃闁稿鍊块弻锟犲炊閳轰焦鐏佺紓浣哄█缁犳牠寮婚悢琛″亾閻㈡鐒惧ù鐘欏洦鐓欓柛鎰絻椤忣偆绱掓潏銊﹀碍妞ゆ挸銈稿畷鍗炍旈崘褎顢樻繝?{{ diagramOverflowCount }} 婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柛娑橈攻閸欏繘鏌ｉ幋锝嗩棄闁哄绶氶弻鐔兼⒒鐎靛壊妲紒鐐劤椤兘寮婚敐澶婄疀妞ゆ帊鐒﹂崕鎾绘⒑閹肩偛濡奸柛濠傛健瀵鈽夐姀鈺傛櫇闂佹寧绻傚Λ娑⑺囬妷褏纾藉ù锝呮惈瀛濈紓鍌氱Т閿曨亜顕ｇ拠宸悑濠㈣泛锕ｇ槐鍫曟⒑閸涘﹥澶勯柛瀣у亾闂佺顑嗛幐鑽ゆ崲濠靛棭娼╅柕澶堝灩娴滈箖鏌涘☉娆愮稇闁活厽顨呴…璺ㄦ崉閾忓湱浼囬梺浼欑畱閻楀﹦鎹㈠┑瀣仺闂傚牊鍒€閵忋倖鐓曞┑鐘插鐢盯鏌￠崨顓犲煟鐎殿喗鎸虫慨鈧柨娑樺楠炴淇婇悙顏勨偓鏍箰妤ｅ啫闂柕澶堝劗閺嬫梹鎱ㄥ璇蹭壕闂佸搫鐬奸崰鏍х暦閿濆棗绶為悗锝庝簴閸嬫捇骞囬鐟颁壕婵炲牆鐏濆▍姗€鏌涢敐蹇曞埌闁伙絿鍏橀幃鈩冩償濡粯鏉搁梻浣稿閸嬩線宕瑰ú顏呭€垫い鏇楀亾婵﹤顭峰畷鎺戔枎閹搭厽袦闂備礁婀遍埛鍫ュ磻閸曨厼寮查梻渚€娼х换鍫ュ磹閺囥垹鍨傞柛宀€鍋為悡鏇㈡煥閺冨浂鍤欐鐐达耿閹绠涢弴鐔告瘎闂侀€炲苯澧紒鐘茬Ч瀹曟洟鏌嗗畵銉ユ处鐎佃偐鈧稒锚娴滄姊洪崫鍕偍闁搞劍妞藉畷鎰板醇閺囩喓鍘介梺褰掑亰閸樿偐寰婃繝姘厓闂佸灝顑嗛埛鎺旂磼鏉堛劌娴柟顔规櫊椤㈡瑩鎮℃惔鈽嗘渐缂傚倸鍊烽懗鍓佸垝椤栫偞鍎庢い鏍仜缁犳牠鏌嶉埡浣告殲闁稿海鍠栭弻銊モ攽閸℃ê娅ч梺鍛婎焾婵倗鎹㈠┑鍡忔灁闁割煈鍠楅悘鍫ユ⒑閹稿孩纾搁柛搴ㄤ憾閳ユ棃宕橀埡鍐炬祫闁诲函缍嗛崜娆戠矈閿曞倹鈷戦柛婵嗗閳诲鏌涘Ο鍦煓鐎规洘鍔欓幃婊堟嚍閵壯冨箥缂傚倸鍊烽悞锕傛晪婵烇絽娴傞崹鍫曞蓟閿濆棙鍎熼柕鍫濇瑜把勭箾閿濆懏鎼愰柨鏇ㄤ邯楠炲啫鈻庨幙鍐╂櫆闂佸憡娲忛崝灞剧妤ｅ啯鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡寮诲☉銏╂晝闁挎繂妫涢ˇ銉╂⒑閹肩偛濡奸柛濠傛健瀵鏁愭径瀣簻缂備礁顑堝▔鏇°亹閸儲鈷戦柟绋挎捣缁犳挻銇勯敂璇茬仯缂侇喛顕ч埥澶娾枎瀹ュ嫮鐩庨梻浣侯攰閹活亞寰婇崐鐕佹毐闂傚倷娴囬褎顨ラ幖浣测偓锕€鐣￠柇锔界稁闂佹儳绻楅～澶愬窗閸℃稒鐓曢柡鍥ュ妼娴滄粌鈹戦鍝勭伈婵﹥妞藉畷顐﹀Ψ閵夛妇鈧鈹戦悙鐐光偓瀣崲濠靛宓侀柛鎰靛枟椤ュ牊绻涢幋锝夊摵鐎点倖妞藉娲焻閻愯尪瀚板褜鍠楅妵鍕敃閵忋垻顔囬柣鎾卞€栭妵鍕疀閹炬潙娅ч梺鍛婃⒒閺佽顫忛搹鍦＜婵☆垰鎼～鎴︽煟韫囨挻绂嬪ù婊呭仱閸┾偓妞ゆ帊鑳堕。鍙夌節閵忊槄鑰块柍銉畵閹虫顢涢敐鍡┾偓鍥⒒娴ｈ鍋犻柛鏂跨У缁绘稒绻濋崶褎妲梺閫炲苯澧柕鍥у楠炴帡宕卞鎯ь棜闂傚倷娴囬褏鎹㈤幋锔藉殞濡わ絽鍟犻埀顒婄畵瀹曞綊顢欓妷褍鏋斿ù婊勬倐瀵€燁槺濠㈣娲栭埞鎴︻敊缁涘鍔烽梺鍛婎焼閸曨剚鐝烽梺鍦檸閸犳鎮￠妷锔剧瘈闂傚牊绋撴晶鏇灻归悩宕囩煉闁哄苯绉堕幉鎾礋椤愩倓鎮ｉ梻渚€鈧偛鑻晶鍓х磼闊厾鐭欓柟顔矫～婵堟崉閾忚鐓ｉ梻浣瑰缁诲倿藝娴兼潙鐓曢柟瀵稿Х绾捐棄霉閿濆牆浜楅柟杈鹃檮閸嬪倿鏌曟竟顖楀亾闁稿鎸搁埢鎾诲垂椤旂晫浜梻浣虹帛閻楁洟濡堕幖浣哄祦闁告劦鐓堝銊╂煃瑜滈崜娆撴偩瀹勯偊娼ㄩ柍褜鍓熼妴渚€寮崼婵嗚€垮┑鐐叉閻熝囨⒒椤栫偞鈷掗柛灞剧懆閸忓本銇勯鐐靛ⅵ鐎殿喚鏁婚、妤呭礋椤掆偓娴狀參姊洪棃娴ュ牓寮查埡鍛瀬濠电姴鍋嗛悢鍡涙煠閹间焦娑у┑顔肩墦閺?{{ DIAGRAM_MAX_NODES - 1 }} 婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柛娑橈攻閸欏繘鏌ｉ幋锝嗩棄闁哄绶氶弻鐔兼⒒鐎靛壊妲紒鐐劤椤兘寮婚敐澶婄疀妞ゆ帊鐒﹂崕鎾绘⒑閹肩偛濡奸柛濠傛健瀵鈽夐姀鈺傛櫇闂佹寧绻傚Λ娑⑺囬妷褏纾藉ù锝呮惈瀛濈紓鍌氱Т閿曨亜顕ｇ拠宸悑濠㈣泛锕ｇ槐鍫曟⒑閸涘﹥澶勯柛瀣у亾闂佺顑嗛幐鑽ゆ崲濠靛棭娼╅柕澶堝灩娴滈箖鏌涘☉娆愮稇缂佺姷鏁婚弻鐔兼倻濡偐鐣洪柣搴ㄦ涧閻倿寮婚敐鍡樺劅妞ゆ牗绮庢牎濠电偛鐡ㄧ划宥囧垝閹炬眹鈧礁螖閸涱収娼婇柟楦挎珪缁?          </el-tag>
        </div>

        <div class="diagram-board-scroll">
          <div ref="diagramBoardRef" class="diagram-board">
            <svg :viewBox="`0 0 ${diagramWidth} ${diagramHeight}`" preserveAspectRatio="xMinYMin meet">
            <defs>
              <marker
                id="arrowHead"
                markerWidth="10"
                markerHeight="8"
                refX="9"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L10,4 L0,8 z" fill="#909399" />
              </marker>
            </defs>

            <g v-for="line in diagramLines" :key="line.key">
              <line
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                stroke="#909399"
                stroke-width="1.5"
                marker-end="url(#arrowHead)"
              />
              <text
                :x="(line.x1 + line.x2) / 2"
                :y="(line.y1 + line.y2) / 2 - 4"
                fill="#606266"
                font-size="12"
              >
                {{ line.label }}
              </text>
            </g>
            </svg>

            <div
              v-for="node in diagramNodes"
              :key="node.key"
              class="diagram-node"
              :class="{ center: node.isCenter, dragging: draggingNodeKey === node.key }"
              :style="{ left: `${node.x}px`, top: `${node.y}px` }"
              @mousedown.stop.prevent="startNodeDrag(node, $event)"
              @click="handleDiagramNodeClick(node)"
            >
              <div class="diagram-node-title">{{ node.entityType.name }}</div>
              <div class="diagram-node-type">{{ node.entityType.fullName }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <json-viewer-dialog v-model="rawDialogVisible" :data="selectedRawData" :title="rawDialogTitle" />
    <type-inheritance-tree
      v-model="inheritanceDialogVisible"
      :types="inheritanceTypesForDialog"
      :current-type-name="inheritanceCurrentTypeName"
      :kind="inheritanceKind"
      @select-type="handleInheritanceTypeSelect"
    />
  </section>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import JsonViewerDialog from './components/jsonViewerDialog.vue'
import EnumTypeDetail from './components/enumType.vue'
import TypeInheritanceTree from './components/typeInheritanceTree.vue'
import sampleMetadataXml from '../assets/metadata.xml?raw'
import { extractServiceRoot, parseODataMetadata } from '../utils/odata-metadata'
import type {
  ODataAction,
  ODataActionImport,
  ODataAnnotationItem,
  ODataComplexType,
  ODataEntitySet,
  ODataEntityType,
  ODataEnumType,
  ODataFunction,
  ODataFunctionImport,
  ODataMetadataModel,
  ODataNavigationProperty,
  ODataProperty,
  ODataRelationCardinality,
  ODataTerm,
  SchemaTreeNode,
  TypeRef,
} from '../utils/odata-types'
import { loadHistory, saveHistory } from '../utils/persist'
import type { TsGeneratorOptions } from '../utils/ts-generator'
import { generateTypeScriptDefinition } from '../utils/ts-generator'

const metadataUrl = ref('')
const selectedHistoryUrl = ref('')
const historyUrls = ref<string[]>([])
const connecting = ref(false)
const metadataModel = ref<ODataMetadataModel | null>(null)
const pageTab = ref<'connect' | 'explorer'>('connect')
const selectedNodeKey = ref('')
const activeTab = ref('table')
const treeRef = ref()
const sidebarWidth = ref(300)
const isSidebarResizing = ref(false)

const tsOptions = ref<TsGeneratorOptions>({
  numberAsNumber: true,
  dateTimeOffsetAsString: true,
})

const selectedFields = ref<string[]>([])
const selectedExpands = ref<string[]>([])
const filterText = ref('')
const topValue = ref(20)
const tryItLoading = ref(false)
const tryItResponse = ref('')
const builderResourcePath = ref('')
const builderSelectedFields = ref<string[]>([])
const builderSelectedExpands = ref<string[]>([])
const builderFilterText = ref('')
const builderOrderByText = ref('')
const builderTopValue = ref(20)
const builderSkipValue = ref(0)
const builderCountValue = ref(false)
const builderRequestLoading = ref(false)
const builderResponseText = ref('')

const rawDialogVisible = ref(false)
const inheritanceDialogVisible = ref(false)
const erDialogVisible = ref(false)
const diagramBoardRef = ref<HTMLElement | null>(null)
const diagramWidth = ref(980)
const diagramHeight = ref(980)
const draggingNodeKey = ref('')
const suppressedClickNodeKey = ref('')
const diagramNodePositionOverrides = ref<Record<string, { x: number; y: number }>>({})

const DIAGRAM_MAX_NODES = 20
const diagramNodeWidth = 190
const diagramNodeHeight = 72
const SIDEBAR_MIN_WIDTH = 240
const SIDEBAR_MAX_WIDTH = 640

const workspaceStyle = computed(() => ({
  gridTemplateColumns: `${sidebarWidth.value}px 12px minmax(0, 1fr)`,
}))

const treeData = computed(() => metadataModel.value?.tree ?? [])

interface NavigationRow extends ODataNavigationProperty {
  cardinality: ODataRelationCardinality
  targetEntitySet: ODataEntitySet | null
}

interface InheritanceDialogType {
  name: string
  fullName: string
  abstract?: boolean
  baseType?: string
  baseTypeFullName?: string
  kind: 'entityType' | 'complexType'
}

const treeNodeMap = computed(() => {
  const nodeMap: Record<string, SchemaTreeNode> = {}
  const travel = (nodes: SchemaTreeNode[]) => {
    for (const node of nodes) {
      nodeMap[node.key] = node
      if (node.children?.length) {
        travel(node.children)
      }
    }
  }
  travel(treeData.value)
  return nodeMap
})

const selectedNode = computed(() => {
  if (!selectedNodeKey.value) {
    return null
  }
  return treeNodeMap.value[selectedNodeKey.value] ?? null
})

const selectedLeafNode = computed(() => {
  if (!selectedNode.value) {
    return null
  }
  if (selectedNode.value.kind === 'namespace' || selectedNode.value.kind === 'category') {
    return null
  }
  return selectedNode.value
})

const selectedEntitySetNode = computed(() => {
  if (selectedLeafNode.value?.kind !== 'entitySet') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEntitySet
})

const selectedEntityTypeNode = computed<ODataEntityType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'entityType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEntityType
})

const isAbstractEntityTypeNode = (node: SchemaTreeNode) => {
  if (node.kind !== 'entityType') {
    return false
  }
  return Boolean((node.payload as ODataEntityType | undefined)?.abstract)
}

const selectedComplexTypeNode = computed<ODataComplexType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'complexType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataComplexType
})

const selectedEnumTypeNode = computed<ODataEnumType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'enumType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEnumType
})

const selectedTermNode = computed<ODataTerm | null>(() => {
  if (selectedLeafNode.value?.kind !== 'term') {
    return null
  }
  return selectedLeafNode.value.payload as ODataTerm
})

const selectedActionNode = computed<ODataAction | null>(() => {
  if (selectedLeafNode.value?.kind !== 'action') {
    return null
  }
  return selectedLeafNode.value.payload as ODataAction
})

const selectedFunctionNode = computed<ODataFunction | null>(() => {
  if (selectedLeafNode.value?.kind !== 'function') {
    return null
  }
  return selectedLeafNode.value.payload as ODataFunction
})

const selectedActionImportNode = computed<ODataActionImport | null>(() => {
  if (selectedLeafNode.value?.kind !== 'actionImport') {
    return null
  }
  return selectedLeafNode.value.payload as ODataActionImport
})

const selectedFunctionImportNode = computed<ODataFunctionImport | null>(() => {
  if (selectedLeafNode.value?.kind !== 'functionImport') {
    return null
  }
  return selectedLeafNode.value.payload as ODataFunctionImport
})

const selectedOperationNode = computed<ODataAction | ODataFunction | null>(
  () => selectedActionNode.value ?? selectedFunctionNode.value,
)

const selectedOperationImportNode = computed<ODataActionImport | ODataFunctionImport | null>(
  () => selectedActionImportNode.value ?? selectedFunctionImportNode.value,
)

const erCenterEntityType = computed<ODataEntityType | null>(() => selectedEntityTypeNode.value)

const canOpenErDialog = computed(() => Boolean(metadataModel.value && erCenterEntityType.value))

const erButtonTooltip = computed(() => {
  if (!metadataModel.value) {
    return 'Please load metadata first'
  }
  if (!selectedLeafNode.value) {
    return 'Please select an EntityType node on the left'
  }
  if (!erCenterEntityType.value) {
    return 'ER diagram is available only for EntityType nodes'
  }
  return 'Build relationship diagram with current EntityType as center'
})

const resolveEntityTypeByEntitySet = (entitySet: ODataEntitySet): ODataEntityType | null => {
  if (!metadataModel.value) {
    return null
  }
  return (
    metadataModel.value.entityTypeMap[entitySet.entityTypeFullName] ??
    metadataModel.value.entityTypeMap[entitySet.entityTypeName] ??
    null
  )
}

const findEntitySetByTypeRef = (typeRef: TypeRef): ODataEntitySet | null => {
  if (!metadataModel.value) {
    return null
  }

  return (
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeFullName === typeRef.fullName) ??
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeName === typeRef.shortName) ??
    null
  )
}

const findEntityTypeByTypeRef = (typeRef: TypeRef): ODataEntityType | null => {
  if (!metadataModel.value) {
    return null
  }

  return (
    metadataModel.value.entityTypeMap[typeRef.fullName] ??
    metadataModel.value.entityTypeMap[typeRef.shortName] ??
    null
  )
}

const selectedEntityTypeForDetails = computed<ODataEntityType | null>(() => {
  if (selectedEntitySetNode.value) {
    return resolveEntityTypeByEntitySet(selectedEntitySetNode.value)
  }
  if (selectedEntityTypeNode.value) {
    return selectedEntityTypeNode.value
  }
  return null
})

const selectedEntitySetForDetails = computed<ODataEntitySet | null>(() => {
  if (selectedEntitySetNode.value) {
    return selectedEntitySetNode.value
  }
  if (!metadataModel.value || !selectedEntityTypeForDetails.value) {
    return null
  }
  return (
    metadataModel.value.entitySets.find(
      (entitySet) =>
        entitySet.entityTypeFullName === selectedEntityTypeForDetails.value?.fullName ||
        entitySet.entityTypeName === selectedEntityTypeForDetails.value?.name,
    ) ?? null
  )
})

const selectedEntityTypeForTryIt = computed<ODataEntityType | null>(() => {
  if (!selectedEntitySetNode.value) {
    return null
  }
  return resolveEntityTypeByEntitySet(selectedEntitySetNode.value)
})

const selectedEntityTypeForBuilder = computed<ODataEntityType | null>(() => selectedEntityTypeForDetails.value)

const selectedEntitySetForBuilder = computed<ODataEntitySet | null>(() => selectedEntitySetForDetails.value)

const propertyRows = computed<ODataProperty[]>(() => {
  if (selectedEntityTypeForDetails.value) {
    return selectedEntityTypeForDetails.value.properties
  }
  if (selectedComplexTypeNode.value) {
    return selectedComplexTypeNode.value.properties
  }
  return []
})

const findReverseNavigation = (
  sourceEntityType: ODataEntityType,
  targetEntityType: ODataEntityType,
  sourceNavigation: ODataNavigationProperty,
): ODataNavigationProperty | undefined => {
  if (sourceNavigation.partner) {
    const byPartner = targetEntityType.navigationProperties.find((item) => item.name === sourceNavigation.partner)
    if (byPartner) {
      return byPartner
    }
  }

  return targetEntityType.navigationProperties.find(
    (item) =>
      item.type.fullName === sourceEntityType.fullName ||
      item.type.shortName === sourceEntityType.name ||
      item.type.fullName === sourceEntityType.name,
  )
}

const resolveCardinalityFromNavigation = (
  navigation: ODataNavigationProperty,
  reverseNavigation?: ODataNavigationProperty,
): ODataRelationCardinality => {
  const sourceMany = navigation.type.isCollection
  const targetMany = reverseNavigation?.type.isCollection ?? false

  if (sourceMany && targetMany) {
    return 'N:N'
  }
  if (sourceMany || targetMany) {
    return '1:N'
  }
  return '1:1'
}

const makePairKey = (left: string, right: string): string => (left < right ? `${left}|${right}` : `${right}|${left}`)

const resolveNavigationCardinality = (
  navigation: ODataNavigationProperty,
  targetEntitySet: ODataEntitySet | null,
): ODataRelationCardinality => {
  const sourceEntityType = selectedEntityTypeForDetails.value
  if (!sourceEntityType) {
    return '1:1'
  }

  if (metadataModel.value && selectedEntitySetForDetails.value && targetEntitySet) {
    const graphKey = makePairKey(selectedEntitySetForDetails.value.fullName, targetEntitySet.fullName)
    const graphEdge = metadataModel.value.relationGraph.edgeMap[graphKey]
    if (graphEdge) {
      return graphEdge.cardinality
    }
  }

  const targetEntityType = targetEntitySet
    ? resolveEntityTypeByEntitySet(targetEntitySet)
    : findEntityTypeByTypeRef(navigation.type)

  if (!targetEntityType) {
    return navigation.type.isCollection ? '1:N' : '1:1'
  }

  const reverseNavigation = findReverseNavigation(sourceEntityType, targetEntityType, navigation)
  return resolveCardinalityFromNavigation(navigation, reverseNavigation)
}

const navigationRows = computed<NavigationRow[]>(() => {
  if (!selectedEntityTypeForDetails.value) {
    return []
  }

  return selectedEntityTypeForDetails.value.navigationProperties.map((navigation) => {
    const targetEntitySet = findEntitySetByTypeRef(navigation.type)
    return {
      ...navigation,
      cardinality: resolveNavigationCardinality(navigation, targetEntitySet),
      targetEntitySet,
    }
  })
})

const selectedTypeForCode = computed(
  () => selectedEntityTypeForDetails.value ?? selectedComplexTypeNode.value ?? selectedEnumTypeNode.value,
)

const tsCode = computed(() => {
  if (!metadataModel.value) {
    return '// 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧湱鈧懓瀚崳纾嬨亹閹烘垹鍊為悷婊冪箻瀵娊鏁冮崒娑氬幈濡炪値鍘介崹鍨濠靛鐓曟繛鍡楃箳缁犲鏌＄仦绋垮⒉鐎垫澘瀚埀顒婄秵娴滄繈顢欓崨顓涙斀闁绘劕寮堕埢鏇灻瑰鍕煀婵炴彃鐏濋埞鎴︽偐椤旇偐浼囧┑鐐差槹閻╊垶寮崘顔嘉ч柛銉簻灏忛梻渚€娼чˇ顐﹀疾濠婂牆鐓曢柟杈鹃檮閻撴洘绻濋棃娑欘棞妞ゅ浚鍓氶妵鍕敃椤掑倻鏆ら梺鍝勬湰缁嬫帡骞嗛弮鍫澪╅柕鍫濇閺嬨倝鏌ｆ惔銈庢綈婵炲弶顭囬弫顕€鍩勯崘褏绠氶梺褰掓？閻掞箓寮插鍫熺厱闁圭偓顨呴懟顖炲疾椤撱垺鈷掗柛灞剧懆閸忓矂鏌熼搹顐ｅ磳妞ゃ垺宀搁、姗€濮€閻樼绱遍梻浣虹帛濮婂宕㈣缁鎮╃紒妯煎幈闂佸搫娲㈤崝宀勫焵椤掆偓椤戝骞冮悜钘夌闁惧浚鍋呴弳濠囨⒒娴ｇ顥忛柣鎾崇墦瀹曚即骞掑Δ鈧壕濠氭煙閻愵剚鐏遍柡鈧禒瀣€甸柨婵嗙凹濞寸兘鏌熼懞銉︾婵﹥妞介獮鎰償閿濆洨鏆ゆ俊鐐€х€靛矂宕瑰畷鍥у灊閻犲洦绁村Σ鍫熺箾閸℃小缂併劌顭峰铏规喆閸曨偆顦ㄥ┑鐐差槹閻╊垰顕ｉ幖浣哥睄闁稿本绮庨敍婊堟煟鎼搭垳绉靛ù婊勭箖瀵板嫰宕熼鐘碉紲?OData Metadata'
  }
  if (selectedTermNode.value) {
    return '// Term node does not generate TypeScript definition'
  }
  if (selectedOperationNode.value || selectedOperationImportNode.value) {
    return '// Action/Function/Import nodes do not generate TypeScript definition'
  }
  return generateTypeScriptDefinition(selectedTypeForCode.value, metadataModel.value, tsOptions.value)
})

const detailSubtitle = computed(() => {
  if (selectedEntitySetNode.value) {
    return `${selectedEntitySetNode.value.name} (EntitySet -> ${selectedEntityTypeForDetails.value?.name ?? selectedEntitySetNode.value.entityTypeName})`
  }
  if (selectedEntityTypeNode.value) {
    return `${selectedEntityTypeNode.value.name} (EntityType)`
  }
  if (selectedComplexTypeNode.value) {
    return `${selectedComplexTypeNode.value.name} (ComplexType)`
  }
  if (selectedEnumTypeNode.value) {
    return `${selectedEnumTypeNode.value.name} (EnumType)`
  }
  if (selectedTermNode.value) {
    return `${selectedTermNode.value.name} (Term)`
  }
  if (selectedActionNode.value) {
    return `${selectedActionNode.value.name} (Action)`
  }
  if (selectedFunctionNode.value) {
    return `${selectedFunctionNode.value.name} (Function)`
  }
  if (selectedActionImportNode.value) {
    return `${selectedActionImportNode.value.name} (ActionImport)`
  }
  if (selectedFunctionImportNode.value) {
    return `${selectedFunctionImportNode.value.name} (FunctionImport)`
  }
  return 'No node selected'
})

const activeServiceRoot = computed(() => {
  if (metadataModel.value?.serviceRoot) {
    return metadataModel.value.serviceRoot
  }
  return extractServiceRoot(metadataUrl.value)
})

const generatedTryItUrl = computed(() => {
  if (!selectedEntitySetNode.value || !activeServiceRoot.value) {
    return ''
  }
  const params = new URLSearchParams()
  if (selectedFields.value.length) {
    params.set('$select', selectedFields.value.join(','))
  }
  if (selectedExpands.value.length) {
    params.set('$expand', selectedExpands.value.join(','))
  }
  if (filterText.value.trim()) {
    params.set('$filter', filterText.value.trim())
  }
  if (topValue.value > 0) {
    params.set('$top', String(topValue.value))
  }
  const query = params.toString()
  const root = activeServiceRoot.value.replace(/\/$/, '')
  return `${root}/${selectedEntitySetNode.value.name}${query ? `?${query}` : ''}`
})

const generatedBuilderUrl = computed(() => {
  if (!activeServiceRoot.value) {
    return ''
  }
  const resourcePath = builderResourcePath.value.trim()
  if (!resourcePath) {
    return ''
  }

  const params = new URLSearchParams()
  if (builderSelectedFields.value.length) {
    params.set('$select', builderSelectedFields.value.join(','))
  }
  if (builderSelectedExpands.value.length) {
    params.set('$expand', builderSelectedExpands.value.join(','))
  }
  if (builderFilterText.value.trim()) {
    params.set('$filter', builderFilterText.value.trim())
  }
  if (builderOrderByText.value.trim()) {
    params.set('$orderby', builderOrderByText.value.trim())
  }
  if (builderTopValue.value > 0) {
    params.set('$top', String(builderTopValue.value))
  }
  if (builderSkipValue.value > 0) {
    params.set('$skip', String(builderSkipValue.value))
  }
  if (builderCountValue.value) {
    params.set('$count', 'true')
  }
  const query = params.toString()
  const root = activeServiceRoot.value.replace(/\/$/, '')
  const normalizedPath = resourcePath.replace(/^\//, '')
  return `${root}/${normalizedPath}${query ? `?${query}` : ''}`
})

const filterSuggestionTemplates = computed(() => {
  if (!selectedEntityTypeForTryIt.value) {
    return []
  }
  return selectedEntityTypeForTryIt.value.properties.flatMap((field) => [
    { value: `${field.name} eq ` },
    { value: `${field.name} ne ` },
    { value: `${field.name} gt ` },
    { value: `startswith(${field.name}, '')` },
    { value: `contains(${field.name}, '')` },
  ])
})

const builderFilterSuggestionTemplates = computed(() => {
  if (!selectedEntityTypeForBuilder.value) {
    return []
  }
  return selectedEntityTypeForBuilder.value.properties.flatMap((field) => [
    { value: `${field.name} eq ` },
    { value: `${field.name} ne ` },
    { value: `${field.name} gt ` },
    { value: `startswith(${field.name}, '')` },
    { value: `contains(${field.name}, '')` },
  ])
})

const formatTypeRef = (typeRef: TypeRef): string => `${typeRef.shortName}${typeRef.isCollection ? '[]' : ''}`

const termConfigSummary = computed(() => {
  if (!selectedTermNode.value?.config) {
    return ''
  }
  const exclude = new Set(['Nullable', 'DefaultValue', 'BaseTerm', 'AppliesTo'])
  const pairs = Object.entries(selectedTermNode.value.config).filter(([key, value]) => !exclude.has(key) && Boolean(value))
  return pairs.map(([key, value]) => `${key}=${value}`).join(', ')
})

const annotationLabel = (annotation: ODataAnnotationItem): string =>
  annotation.qualifier ? `${annotation.term}#${annotation.qualifier}` : annotation.term

const annotationSummary = (annotations: ODataAnnotationItem[], maxItems = 3): string => {
  if (!annotations.length) {
    return ''
  }
  const limited = annotations.slice(0, maxItems).map((item) => annotationLabel(item))
  const suffix = annotations.length > maxItems ? ` ...(+${annotations.length - maxItems})` : ''
  return `${limited.join(', ')}${suffix}`
}

const annotationFull = (annotations: ODataAnnotationItem[]): string => {
  if (!annotations.length) {
    return ''
  }
  return annotations
    .map((item) => `${annotationLabel(item)}=${item.value || '-'}`)
    .join('; ')
}

const isPrimaryKey = (name: string): boolean => selectedEntityTypeForDetails.value?.keyNames.includes(name) ?? false

const entitySetKey = (entitySet: ODataEntitySet): string => `entitySet:${entitySet.fullName}`
const entityTypeKey = (entityType: ODataEntityType): string => `entityType:${entityType.fullName}`

const syncTreeCurrentNode = (key: string) => {
  if (!key) {
    return
  }
  void nextTick(() => {
    treeRef.value?.setCurrentKey?.(key, true)
    const currentNodeElement = treeRef.value?.$el?.querySelector?.('.el-tree-node.is-current') as
      | HTMLElement
      | null
    currentNodeElement?.scrollIntoView({ block: 'nearest' })
  })
}

const findFirstLeafNode = (nodes: SchemaTreeNode[]): SchemaTreeNode | null => {
  for (const node of nodes) {
    if (node.kind !== 'namespace' && node.kind !== 'category') {
      return node
    }
    if (node.children?.length) {
      const found = findFirstLeafNode(node.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

const useParsedModel = (model: ODataMetadataModel) => {
  metadataModel.value = model
  const firstLeaf = findFirstLeafNode(model.tree)
  selectedNodeKey.value = firstLeaf?.key ?? ''
  pageTab.value = 'explorer'
  activeTab.value = 'table'
  tryItResponse.value = ''
  syncTreeCurrentNode(selectedNodeKey.value)
}

const appendHistory = async (url: string) => {
  const normalized = url.trim()
  if (!normalized) {
    return
  }
  historyUrls.value = [normalized, ...historyUrls.value.filter((item) => item !== normalized)].slice(0, 10)
  await saveHistory(historyUrls.value)
}

const connectByXmlText = (xmlText: string, sourceLabel: string, serviceRoot?: string) => {
  const nextModel = parseODataMetadata(xmlText, sourceLabel, serviceRoot)
  useParsedModel(nextModel)
}

const handleConnectByUrl = async () => {
  const targetUrl = metadataUrl.value.trim()
  if (!targetUrl) {
    ElMessage.warning('闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧湱鈧懓瀚崳纾嬨亹閹烘垹鍊為悷婊冪箻瀵娊鏁冮崒娑氬幈濡炪値鍘介崹鍨濠靛鐓曟繛鍡楃箳缁犲鏌＄仦绋垮⒉鐎垫澘瀚埀顒婄秵娴滄繈顢欓崨顓涙斀闁绘劕寮堕埢鏇灻瑰鍕煀婵炴彃鐏濋埞鎴︽偐椤旇偐浼囧┑鐐差槹閻╊垶寮崘顔嘉ч柛銉簻灏忛梻渚€娼чˇ顐﹀疾濠婂牆鐓曢柟杈鹃檮閻撴洘绻濋棃娑欘棞妞ゅ浚鍓氶妵鍕敃椤掑倻鏆ら梺鍝勬湰缁嬫帡骞嗛弮鍫澪╅柕鍫濇閺嬨倝鏌ｆ惔銈庢綈婵炲弶顭囬弫顕€鍩勯崘褏绠氶梺褰掓？閻掞箓寮插鍫熺厱闁圭偓顨呴懟顖炲疾椤撱垺鈷掗柛灞剧懆閸忓矂鏌熼搹顐ｅ磳妞ゃ垺宀搁、姗€濮€閻樼绱遍梻浣虹帛濮婂宕㈣缁鎮╃紒妯煎幈闂佸搫娲㈤崝宀勭嵁濡偐妫柛鎾楀嫭鐝梺閫炲苯澧紒鐘茬Ч瀹曟洟鏌嗗鍛枃闂婎偄娲︾粙鎴犵玻濡や焦鍙忔俊鐐额嚙娴滈箖姊洪崫鍕槵闁逞屽墮绾绢參寮抽崱娑欑厓鐟滄粓宕滈悢椋庢殾濞村吋娼欓崘鈧銈嗘尵婵绮婇敃鍌涒拺缂侇垱娲栨晶鏌ユ煕閹寸姵鍤€閸楀崬鈹戦悩宕囶暡闁抽攱鍨块弻娑樷攽閸℃浠惧銈冨劗閳ь剝绉悷閭︾叆閹肩补鈧枼鎷梻浣虹《閺備線宕?Metadata URL')
    return
  }

  connecting.value = true
  try {
    const response = await axios.get<string>(targetUrl, {
      responseType: 'text',
      headers: {
        Accept: 'application/xml, text/xml, */*',
      },
    })
    connectByXmlText(response.data, targetUrl, extractServiceRoot(targetUrl))
    await appendHistory(targetUrl)
    ElMessage.success('Metadata connected successfully')
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Connection failed, please check URL or network'
    ElMessage.error(message)
  } finally {
    connecting.value = false
  }
}

const handlePickHistory = (pickedUrl: string | number | boolean) => {
  if (typeof pickedUrl !== 'string' || !pickedUrl) {
    return
  }
  metadataUrl.value = pickedUrl
  void handleConnectByUrl()
}

const loadSampleMetadata = () => {
  try {
    connectByXmlText(sampleMetadataXml, '闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇鐗堢厾缁炬澘宕晶缁樹繆閼碱剙鍘存慨濠勭帛閹峰懘宕ㄦ繝鍐ㄥ壍婵犵數鍋涢惇浼村垂閽樺鏆︾憸鐗堝笒閹硅埖銇勯幘璺盒＄紒妤€顦靛铏圭磼濮楀棛鍔风紓渚囧櫘閸ㄥ爼骞冮垾鏂ユ瀻闁规儳顕崢闈涒攽閻愯尙澧曢柣蹇旂箞瀵鈽夊▎宥勭盎闂佹寧绻傞幊宀勫磻閵忋倖鐓涢悘鐐插⒔閵嗘帡鏌嶈閸撱劎寰婃禒瀣Е闁逞屽墴濮婃椽顢樿閻忥箓鏌″畝瀣？濞寸媴绠撳畷婊嗩槼闁告帗鐩铏瑰寲閺囩喐鐝旈柣搴㈢濠㈡﹢鎮惧畡閭︽建闁逞屽墴閵嗕線寮崼婵嗙獩濡炪倖鎸鹃崰鎾广亹椤栫偞鈷掗柛灞捐壘閳ь剛鍏橀幃鐐烘晝閳ь剟鈥旈崘顔奸敜婵°倐鍋撻柛灞诲姂閺岋綁骞橀崘宸敨濠电偞鍨惰彜闁衡偓娴犲鐓曢柍閿亾闁哄懏绋戦埢鎾诲Ω閳哄倵鎷洪梺鍛婃尰瑜板啯绂嶅┑鍥╃闁告瑥顧€閼拌法鈧娲橀崝娆撳箖濠婂牊鍤嶉柕澹啫绠版繝鐢靛О閸ㄧ厧鈻斿☉銏╂晞闁告稑鐡ㄩ崐鍧楁煟閹伴潧鍘哥紒璇叉閵囧嫰骞囬埡浣轰痪濡炪們鍎抽崑鐔烘?metadata.xml')
    ElMessage.success('Sample metadata loaded')
  } catch {
    ElMessage.error('Sample metadata parse failed')
  }
}

const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
  try {
    const xmlText = await file.text()
    connectByXmlText(xmlText, `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻閻愮儤鍋嬮柣妯荤湽閳ь兛绶氬鎾閳╁啯鐝栭梻渚€鈧偛鑻晶鏉款熆鐟欏嫭绀嬬€规洜鍏橀、姗€鎮╃喊澶屽簥闂備浇顕ч崙鐣岀礊閸℃稑纾婚柟鎹愬煐椤洟鏌嶉崫鍕偓鑽ょ不閸撗€鍋撻悷鏉款棌闁哥姵娲滈懞杈ㄧ附閸涘﹦鍘搁梺鍛婁緱閸犳岸宕ｉ埀顒勬⒑閸濆嫭婀扮紒瀣灴閸┿儲寰勯幇顒傜厬濠碘槅鍨抽崢褔宕甸鍕拻? ${file.name}`)
    ElMessage.success('Local XML imported successfully')
  } catch {
    ElMessage.error('XML parse failed, please check file content')
  }
  return false
}

const handleNodeClick = (node: SchemaTreeNode) => {
  if (node.kind === 'category' || node.kind === 'namespace') {
    return
  }
  selectedNodeKey.value = node.key
  activeTab.value = 'table'
}

let sidebarResizeStartX = 0
let sidebarResizeStartWidth = 300

const clampSidebarWidth = (width: number) => {
  const maxByViewport = Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - 360)
  const upper = Math.min(SIDEBAR_MAX_WIDTH, maxByViewport)
  return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), upper)
}

const handleSidebarResizeMove = (event: MouseEvent) => {
  if (!isSidebarResizing.value) {
    return
  }
  const delta = event.clientX - sidebarResizeStartX
  sidebarWidth.value = clampSidebarWidth(sidebarResizeStartWidth + delta)
}

const stopSidebarResize = () => {
  if (!isSidebarResizing.value) {
    return
  }
  isSidebarResizing.value = false
  window.removeEventListener('mousemove', handleSidebarResizeMove)
  window.removeEventListener('mouseup', stopSidebarResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

const startSidebarResize = (event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  if (window.matchMedia('(max-width: 1200px)').matches) {
    return
  }
  isSidebarResizing.value = true
  sidebarResizeStartX = event.clientX
  sidebarResizeStartWidth = sidebarWidth.value
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  window.addEventListener('mousemove', handleSidebarResizeMove)
  window.addEventListener('mouseup', stopSidebarResize)
}

const handleViewportResize = () => {
  sidebarWidth.value = clampSidebarWidth(sidebarWidth.value)
}

const openErDialog = () => {
  if (!canOpenErDialog.value) {
    return
  }
  erDialogVisible.value = true
}

const focusEntitySet = (entitySet: ODataEntitySet) => {
  const key = entitySetKey(entitySet)
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const focusEntityType = (entityType: ODataEntityType) => {
  const key = entityTypeKey(entityType)
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

interface NodeDragState {
  key: string
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  moved: boolean
}

let currentNodeDragState: NodeDragState | null = null
let diagramResizeObserver: ResizeObserver | null = null

const clampDiagramPosition = (x: number, y: number) => {
  const minPadding = 8
  const maxX = Math.max(minPadding, diagramWidth.value - diagramNodeWidth - minPadding)
  const maxY = Math.max(minPadding, diagramHeight.value - diagramNodeHeight - minPadding)
  return {
    x: Math.min(Math.max(minPadding, x), maxX),
    y: Math.min(Math.max(minPadding, y), maxY),
  }
}

const resetDiagramNodeOverrides = () => {
  diagramNodePositionOverrides.value = {}
}

const syncDiagramSize = () => {
  const board = diagramBoardRef.value
  if (!board) {
    return
  }
  const width = Math.max(640, Math.floor(board.clientWidth))
  const height = Math.max(520, Math.floor(board.clientHeight))
  diagramWidth.value = width
  diagramHeight.value = height
}

const startDiagramResizeObserve = () => {
  const board = diagramBoardRef.value
  if (!board) {
    return
  }
  diagramResizeObserver?.disconnect()
  diagramResizeObserver = new ResizeObserver(() => {
    syncDiagramSize()
  })
  diagramResizeObserver.observe(board)
  syncDiagramSize()
}

const stopDiagramResizeObserve = () => {
  diagramResizeObserver?.disconnect()
  diagramResizeObserver = null
}

const stopNodeDrag = () => {
  if (currentNodeDragState?.moved) {
    suppressedClickNodeKey.value = currentNodeDragState.key
  }
  currentNodeDragState = null
  draggingNodeKey.value = ''
  window.removeEventListener('mousemove', handleNodeDragMove)
  window.removeEventListener('mouseup', stopNodeDrag)
  document.body.style.userSelect = ''
}

const handleNodeDragMove = (event: MouseEvent) => {
  if (!currentNodeDragState) {
    return
  }
  const deltaX = event.clientX - currentNodeDragState.startPointerX
  const deltaY = event.clientY - currentNodeDragState.startPointerY
  if (!currentNodeDragState.moved && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
    currentNodeDragState.moved = true
  }
  const position = clampDiagramPosition(
    currentNodeDragState.startX + deltaX,
    currentNodeDragState.startY + deltaY,
  )
  diagramNodePositionOverrides.value = {
    ...diagramNodePositionOverrides.value,
    [currentNodeDragState.key]: position,
  }
}

const startNodeDrag = (node: DiagramNode, event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  const currentNode = diagramNodes.value.find((item) => item.key === node.key) ?? node
  currentNodeDragState = {
    key: node.key,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: currentNode.x,
    startY: currentNode.y,
    moved: false,
  }
  draggingNodeKey.value = node.key
  suppressedClickNodeKey.value = ''
  window.addEventListener('mousemove', handleNodeDragMove)
  window.addEventListener('mouseup', stopNodeDrag)
  document.body.style.userSelect = 'none'
}

const handleDiagramNodeClick = (node: DiagramNode) => {
  if (suppressedClickNodeKey.value === node.key) {
    suppressedClickNodeKey.value = ''
    return
  }
  focusEntityType(node.entityType)
}

const focusAction = (action: ODataAction) => {
  const key = `action:${action.signature}`
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const focusFunction = (func: ODataFunction) => {
  const key = `function:${func.signature}`
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const jumpToOperationFromImport = (importNode: ODataActionImport | ODataFunctionImport) => {
  if (!metadataModel.value) {
    return
  }

  const resolveShortName = (name: string) => name.split('.').pop() ?? name

  if (importNode.kind === 'actionImport') {
    const fullName = importNode.action
    const shortName = resolveShortName(fullName)
    const action =
      metadataModel.value.actionMap[fullName] ??
      metadataModel.value.actions.find((item) => item.fullName === fullName || item.name === shortName)
    if (!action) {
      ElMessage.warning(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻閻愮儤鍋嬮柣妯荤湽閳ь兛绶氬鎾閳╁啯鐝曢梻浣藉Г閿氭い锔诲枤缁辨棃寮撮悢铏圭槇闂佹眹鍨藉褍鐡梻浣瑰濞插繘宕愬Δ鍛劦妞ゆ帊绀侀崵顒勬煕閿濆繒绉┑鈩冩尦瀹曘劑寮堕幋鐘靛幀濠电姰鍨煎▔娑㈡儔婵傚憡鍎婇柛顐犲劜閳锋帡鏌涚仦鐐殤濠⒀勭〒缁辨帞鈧綆鍋勭粭鎺撱亜閺傝法绠伴柍瑙勫灩閳ь剨缍嗛崑鍡涘储閽樺鏀介柣妯肩帛濞懷囨煥閺囨ê鈧繈骞冮敓鐘茬疀闁绘鐗忛崢鍨箾閹剧澹橀柣蹇旂箖娣囧﹪宕楃粭杞扮盎濡炪倕绻愮€氼剟寮抽悢鍏肩厵濡炲楠搁埢鍫ユ煟閹垮啫浜版い銏★耿閹粓宕卞鍡橈紖闂?Action: ${fullName}`)
      return
    }
    focusAction(action)
    return
  }

  const fullName = importNode.function
  const shortName = resolveShortName(fullName)
  const func =
    metadataModel.value.functionMap[fullName] ??
    metadataModel.value.functions.find((item) => item.fullName === fullName || item.name === shortName)
  if (!func) {
    ElMessage.warning(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻閻愮儤鍋嬮柣妯荤湽閳ь兛绶氬鎾閳╁啯鐝曢梻浣藉Г閿氭い锔诲枤缁辨棃寮撮悢铏圭槇闂佹眹鍨藉褍鐡梻浣瑰濞插繘宕愬Δ鍛劦妞ゆ帊绀侀崵顒勬煕閿濆繒绉┑鈩冩尦瀹曘劑寮堕幋鐘靛幀濠电姰鍨煎▔娑㈡儔婵傚憡鍎婇柛顐犲劜閳锋帡鏌涚仦鐐殤濠⒀勭〒缁辨帞鈧綆鍋勭粭鎺撱亜閺傝法绠伴柍瑙勫灩閳ь剨缍嗛崑鍡涘储閽樺鏀介柣妯肩帛濞懷囨煥閺囨ê鈧繈骞冮敓鐘茬疀闁绘鐗忛崢鍨箾閹剧澹橀柣蹇旂箖娣囧﹪宕楃粭杞扮盎濡炪倕绻愮€氼剟寮抽悢鍏肩厵濡炲楠搁埢鍫ユ煟閹垮啫浜版い銏★耿閹粓宕卞鍡橈紖闂?Function: ${fullName}`)
    return
  }
  focusFunction(func)
}

const jumpToNavigationTarget = (navigation: NavigationRow) => {
  if (navigation.targetEntitySet) {
    focusEntitySet(navigation.targetEntitySet)
    return
  }

  const targetType = findEntityTypeByTypeRef(navigation.type)
  if (targetType) {
    const key = `entityType:${targetType.fullName}`
    selectedNodeKey.value = key
    treeRef.value?.setCurrentKey?.(key)
    activeTab.value = 'table'
    return
  }

  ElMessage.warning(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻閻愮儤鍋嬮柣妯荤湽閳ь兛绶氬鎾閳╁啯鐝曢梻浣藉Г閿氭い锔诲枤缁辨棃寮撮悢铏圭槇闂佹眹鍨藉褍鐡梻浣瑰濞插繘宕愬Δ鍛劦妞ゆ帊绀侀崵顒勬煕閿濆繒绉┑鈩冩尦瀹曘劑寮堕幋鐘靛幀濠电姰鍨煎▔娑㈡儔婵傚憡鍎婇柛顐犲劜閳锋帡鏌涚仦鐐殤濠⒀勭〒缁辨帞鈧綆鍋勭粭鎺撱亜閺傝法绠伴柍瑙勫灩閳ь剨缍嗛崑鍡涘储閽樺鏀介柣妯肩帛濞懷囨煥閺囨ê鈧繈骞冮敓鐘茬疀闁绘鐗忛崢鍨箾閹剧澹橀柣蹇旂箖娣囧﹪宕楃粭杞扮盎濡炪倕绻愮€氼剟寮抽悢鍏肩厵濡炲楠搁埢鍫ユ煟閹垮啫浜版い銏★耿閹粓宕卞鍡橈紖闂?${navigation.type.shortName} 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧湱鈧懓瀚崳纾嬨亹閹烘垹鍊炲銈嗗笒椤︿即寮查鍫熷仭婵犲﹤鍟版晥濠电姭鍋撳〒姘ｅ亾婵﹨娅ｇ槐鎺懳熼搹閫涚礃婵犵妲呴崑鍕偓姘緲椤曪綁宕ㄦ繝鍕嚌闂侀€炲苯澧寸€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紳婵炶揪绲介幖顐㈡毄濠电姷鏁搁崑鎰板磻閹剧粯鈷戦柛婵嗗閻忛亶鏌涢悩宕囧⒌妤犵偛鍟埢搴ㄥ箼閸愨晜娅岄梻渚€鈧偛鑻晶瀵糕偓瑙勬礃缁诲嫰骞戦崟顓熷仒闁斥晛鍟弶鍛婁繆閻愵亜鈧牕螞娴ｈ倽娑㈠礋椤栨氨鍘洪梺鍝勬储閸ㄦ椽鎮″☉姘ｅ亾閸忓浜鹃柣搴秵閸撴盯鏁嶉悢鍝ョ閻庣數顭堥鎾斥攽閳ヨ櫕鍠樻鐐茬箻閹晝鎷犻懠顒夊斀闂備礁婀遍崕銈夊春閸繍鐒介柕澶嗘櫆閳?EntitySet/EntityType`)
}

const canOpenInheritance = computed(() => Boolean(selectedEntityTypeForDetails.value || selectedComplexTypeNode.value))

const inheritanceTooltip = computed(() => {
  if (!selectedLeafNode.value) {
    return 'Please select a type node first'
  }
  if (selectedEnumTypeNode.value) {
    return 'EnumType has no inheritance tree'
  }
  if (canOpenInheritance.value) {
    return 'View inheritance for current type'
  }
  return 'Current node does not support inheritance'
})

const inheritanceKind = computed<'entityType' | 'complexType'>(() =>
  selectedComplexTypeNode.value ? 'complexType' : 'entityType',
)

const inheritanceCurrentTypeName = computed(
  () => selectedComplexTypeNode.value?.fullName ?? selectedEntityTypeForDetails.value?.fullName ?? '',
)

const inheritanceTypesForDialog = computed<InheritanceDialogType[]>(() => {
  if (!metadataModel.value) {
    return []
  }

  return [
    ...metadataModel.value.entityTypes.map((item) => ({
      name: item.name,
      fullName: item.fullName,
      abstract: item.abstract,
      baseType: item.baseType,
      baseTypeFullName: item.baseTypeFullName,
      kind: 'entityType' as const,
    })),
    ...metadataModel.value.complexTypes.map((item) => ({
      name: item.name,
      fullName: item.fullName,
      abstract: item.abstract,
      baseType: item.baseType,
      baseTypeFullName: item.baseTypeFullName,
      kind: 'complexType' as const,
    })),
  ]
})

const selectedRawData = computed<unknown>(() => {
  if (!metadataModel.value || !selectedLeafNode.value) {
    return null
  }

  if (selectedEntitySetNode.value) {
    const entityType = selectedEntityTypeForDetails.value
    return {
      entitySet:
        metadataModel.value.rawNodeMap[`entitySet:${selectedEntitySetNode.value.fullName}`] ??
        selectedEntitySetNode.value,
      entityType: entityType
        ? metadataModel.value.rawNodeMap[`entityType:${entityType.fullName}`] ?? entityType
        : null,
    }
  }

  if (selectedEntityTypeNode.value) {
    return (
      metadataModel.value.rawNodeMap[`entityType:${selectedEntityTypeNode.value.fullName}`] ??
      selectedEntityTypeNode.value
    )
  }

  if (selectedComplexTypeNode.value) {
    return (
      metadataModel.value.rawNodeMap[`complexType:${selectedComplexTypeNode.value.fullName}`] ??
      selectedComplexTypeNode.value
    )
  }

  if (selectedEnumTypeNode.value) {
    return metadataModel.value.rawNodeMap[`enumType:${selectedEnumTypeNode.value.fullName}`] ?? selectedEnumTypeNode.value
  }

  if (selectedTermNode.value) {
    return metadataModel.value.rawNodeMap[`term:${selectedTermNode.value.fullName}`] ?? selectedTermNode.value
  }

  if (selectedActionNode.value) {
    return metadataModel.value.rawNodeMap[`action:${selectedActionNode.value.signature}`] ?? selectedActionNode.value
  }

  if (selectedFunctionNode.value) {
    return (
      metadataModel.value.rawNodeMap[`function:${selectedFunctionNode.value.signature}`] ?? selectedFunctionNode.value
    )
  }

  if (selectedActionImportNode.value) {
    return (
      metadataModel.value.rawNodeMap[`actionImport:${selectedActionImportNode.value.fullName}`] ??
      selectedActionImportNode.value
    )
  }

  if (selectedFunctionImportNode.value) {
    return (
      metadataModel.value.rawNodeMap[`functionImport:${selectedFunctionImportNode.value.fullName}`] ??
      selectedFunctionImportNode.value
    )
  }

  return null
})

const rawDialogTitle = computed(() => {
  if (selectedEntitySetNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - EntitySet ${selectedEntitySetNode.value.name}`
  }
  if (selectedEntityTypeNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - EntityType ${selectedEntityTypeNode.value.name}`
  }
  if (selectedComplexTypeNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - ComplexType ${selectedComplexTypeNode.value.name}`
  }
  if (selectedEnumTypeNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - EnumType ${selectedEnumTypeNode.value.name}`
  }
  if (selectedTermNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - Term ${selectedTermNode.value.name}`
  }
  if (selectedActionNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - Action ${selectedActionNode.value.name}`
  }
  if (selectedFunctionNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - Function ${selectedFunctionNode.value.name}`
  }
  if (selectedActionImportNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - ActionImport ${selectedActionImportNode.value.name}`
  }
  if (selectedFunctionImportNode.value) {
    return `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON - FunctionImport ${selectedFunctionImportNode.value.name}`
  }
  return '闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簼閹癸綁鏌ｉ鐐搭棞闁靛棙甯掗～婵嬫晲閸涱剙顥氬┑掳鍊楁慨鐑藉磻濞戔懞鍥偨缁嬫寧鐎梺鐟板⒔缁垶宕戦幇顓滀簻闁归偊鍠栭弸搴∶瑰鍫㈢暫闁哄被鍔戝鎾倷濞村浜鹃柟闂寸劍閸婂嘲鈹戦悩鎻掓殧濞存粍绮撻弻鐔煎传閸曨剦妫炴繛瀛樼矊婢х晫妲愰幘瀛樺闁荤喐婢橀～宥咁渻閵堝啫濡奸柨鏇ㄤ邯閹即顢氶埀顒€顕ｆ禒瀣垫晣闁绘劖顔栭崯鍥ㄤ繆閻愵亜鈧牠骞愰悙顒佸弿閻庨潧鎲￠弳婊堟煏婵炑冩噽閿?JSON'
})

const openRawDialog = () => {
  if (!selectedLeafNode.value) {
    return
  }
  rawDialogVisible.value = true
}

const openInheritanceDialog = () => {
  if (!canOpenInheritance.value) {
    return
  }
  inheritanceDialogVisible.value = true
}

const handleInheritanceTypeSelect = (payload: { fullName: string; kind: 'entityType' | 'complexType' }) => {
  const key = `${payload.kind}:${payload.fullName}`
  if (!treeNodeMap.value[key]) {
    ElMessage.warning(`Node not found for ${payload.fullName}`)
    return
  }
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const copyTsCode = async () => {
  try {
    await navigator.clipboard.writeText(tsCode.value)
    ElMessage.success('TypeScript definition copied')
  } catch {
    ElMessage.error('Copy failed, please copy manually')
  }
}

const runTryIt = async () => {
  if (!generatedTryItUrl.value) {
    ElMessage.warning('闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧湱鈧懓瀚崳纾嬨亹閹烘垹鍊為悷婊冪箻瀵娊鏁冮崒娑氬幈濡炪値鍘介崹鍨濠靛鐓曟繛鍡楃箳缁犲鏌＄仦绋垮⒉鐎垫澘瀚埀顒婄秵娴滄繈顢欓崨顓涙斀闁绘劕寮堕埢鏇灻瑰鍕煀婵炴彃鐏濋埞鎴︽偐椤旇偐浼囧┑鐐差槹閻╊垶寮崘顔嘉ч柛銉簻灏忛梻渚€娼чˇ顐﹀疾濠婂牆鐓曢柟杈鹃檮閻撴洘绻濋棃娑欘棞妞ゅ浚鍓氶妵鍕敃椤掑倻鏆ら梺鍝勬湰缁嬫帡骞嗛弮鍫澪╅柕鍫濇閺嬨倝鏌ｆ惔銈庢綈婵炲弶顭囬弫顕€鍩勯崘褏绠氶梺褰掓？閻掞箓寮插鍫熺厱闁圭偓顨呴懟顖炲疾椤撱垺鈷掗柛灞剧懆閸忓矂鏌熼搹顐ｅ磳妞ゃ垺宀搁、姗€濮€閻樼绱遍梻浣虹帛濮婂宕㈣缁鎮╃紒妯煎幈闂佸搫娲㈤崝宀勫焵椤掆偓椤戝骞冮悜钘夌闁惧浚鍋呴弳濠囨⒒娴ｇ顥忛柣鎾崇墦瀹曚即骞掑Δ鈧壕濠氭煙閻愵剚鐏遍柡鈧禒瀣€甸柨婵嗙凹濞寸兘鏌熼懞銉︾婵﹥妞介獮鎰償閿濆洨鏆ゆ俊鐐€х€靛矂宕瑰畷鍥у灊閻犲洦绁村Σ鍫熺箾閸℃小缂併劌顭峰铏规喆閸曨偆顦ㄥ┑鐐差槹閻╊垰顕ｉ幖浣哥睄闁稿本绮庨敍婊堟煟鎼搭垳绉靛ù婊勭箖瀵板嫰宕熼鐘碉紲?URL 缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鎯у⒔閹虫捇鈥旈崘顏佸亾閿濆簼绨绘い鎺嬪灪閵囧嫰骞囬鍡欑厯闂佸搫琚崝鎴﹀箖閵忋倕浼犻柛鏇熷灟閸ㄥ鎯€椤忓牆绠查柟浼存涧濞堫厼顪冮妶搴″箹婵炵》绻濋獮濠傤煥閸噥妫冨┑鐐村灦椤嫰寮撮姀鈾€鎷洪柡澶屽仦婢瑰棝藝閿斿浜滈柟瀛樼箖閸犳ɑ顨ラ悙宸█妤犵偞鐗楅幏鍛村传閵壯勭秮闂傚倷绀佹竟濠囧磻閸涱垱宕查柛鏇ㄥ灡閸嬧晠鏌涘┑鍡楊仱闁衡偓娴犲绠抽柟鎯版绾惧綊鏌￠崶銉ョ仼缂佺姷濞€閻擃偊宕堕妸褉妲堢紒鎯у⒔閹虫捇鍩為幋锔藉亹鐎规洖娴傞弳锟犳⒑缂佹ɑ灏靛┑鐐╁亾闂佸搫鐬奸崰鏍€佸鈧幃銏☆槹鎼达絾鍣梻鍌欑閹测€愁潖閻熸壆鏆嗛柟闂寸閽?Metadata闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻锝夊箣閿濆憛鎾绘煕婵犲倹鍋ラ柡灞诲姂瀵噣宕奸悢鍛婎唶闂備胶顭堥鍡涘箰閸撗冨灊妞ゆ挾鍋愬Σ鍫熶繆椤栨繍鍤欐繛鍛囧洦鈷戞繛鑼额嚙楠炴鏌ｉ悢鍙夋珚鐎殿喖顭烽幃銏ゅ川婵犲嫮肖濠德板€х徊浠嬪疮椤栫儐鏁佺€广儱顦伴埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鐘茬暦濠靛鍐€妞ゆ挾鍊ｉ敃鍌涚厱闁哄洢鍔岄悘鐘绘煕閹般劌浜惧┑锛勫亼閸婃牠宕濋敃鈧…鍧楀焵椤掍胶绠剧€光偓婵犱線鍋楀┑顔硷攻濡炰粙鐛弽顓熷€锋繛鏉戭儏娴滈箖鏌″搴″箹缂佲偓婢跺绠鹃柛鈩兩戠亸顓㈡煢閸愵亜鏋涢柡灞诲妼閳规垿宕遍埡鍌傦箑鈹戦埥鍡椾簼闁挎洏鍨藉璇测槈閳垛斁鍋撻敃鍌氱婵犻潧娲ㄦ禍鍫曟⒒娴ｄ警鐒炬い顓у墴瀹曞湱鎹勬笟顖涚稁闂佹儳绻愬﹢杈╁閸忛棿绻嗘い鏍ㄧ箖椤忕姵銇勯幋婵嗩仼妞ゎ亜鍟存俊鍫曞幢濡灝浜栭梻浣规偠閸庤崵寰婂ú顏勭；闁瑰墽绮弲婊堟煟閹伴潧澧痪缁㈠灦濮婃椽妫冨☉杈╁彋缂備胶濮甸崹瑙勭珶閺囥埄鏁嶆繛鎴炴皑椤旀洟姊洪崷顓炰壕婵炲吋鐟╁畷鐢割敆閸曨剛鍘遍梺闈涱焾閸婃洖鐣甸崱娆屽亾鐟欏嫭绀冪紒顔芥尭椤曪絿鎹勭悰鈩冪€婚梺缁樺姦閸撴瑩鎯?EntitySet')
    return
  }
  tryItLoading.value = true
  try {
    const response = await axios.get(generatedTryItUrl.value, {
      headers: {
        Accept: 'application/json',
      },
    })
    tryItResponse.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Request failed'
    tryItResponse.value = message
    ElMessage.error(message)
  } finally {
    tryItLoading.value = false
  }
}

const copyBuilderUrl = async () => {
  if (!generatedBuilderUrl.value) {
    ElMessage.warning('闂傚倸鍊搁崐鎼佸磹瀹勬噴褰掑炊瑜忛弳锕傛煟閵忋埄鐒剧紒鎰殜閺岀喖鏌囬敃鈧弸娑㈡煕閵婏妇绠炴鐐寸墪鑿愭い鎺嗗亾闁诲浚浜濈换娑㈠川椤栨锝吳庨崶褝韬┑鈥崇埣瀹曘劑顢欓崗纰变哗缂傚倸鍊烽懗鑸垫叏閹惰棄纭€闁规儼妫勯拑鐔哥箾閹寸們姘ｉ崼鐔稿弿婵°倐鍋撻柣妤€锕顐﹀箚瑜夐弨浠嬫煟閹邦剙绾ч柛锝堟閳规垿鎮欓埡浣峰闂傚倷绀侀幖顐︽儗婢跺苯绶ら柛濠勫枔娴滀粙姊绘担鍝勫付妞ゎ偅娲熷畷鎰板箣閿曗偓绾惧鏌ｉ幇顔煎妺闁抽攱鍨块弻娑樷攽閸℃浼€闂佺粯甯熷▔鏇犳閹烘鍋愰柧蹇ｅ亜绾炬娊鎮楀▓鍨灕妞ゆ泦鍥舵晣闁稿繒鍘х欢鐐测攽閻樻彃顏╂鐐村姇閳规垿鎮欓懜闈涙锭缂備浇寮撶划娆撶嵁婢舵劕鐏抽柡鍌樺劜閻忎線姊洪懖鈹炬嫛闁告挻绋撴竟鏇㈡寠婢规繂缍婇弫鎰板川椤旇棄鍓甸梺鍝勭▌缁绘繈寮婚敐澶婎潊闁宠桨鑳舵导鍫㈢磽娴ｈ櫣甯涚紒璇插€块、姘舵晲閸ャ劌鐝板┑鐐存綑椤戝棝锝炲鍛斀闁宠棄妫楅悘锕傛煛閳ь剟鏌嗗鍡椻偓鐢告偣閸ャ劎銈撮柡鈧禒瀣厓闁芥ê顦伴ˉ婊堟煟韫囧鍔滅紒缁樼洴瀹曨亪宕橀鍠╂垹绱撴担绋库偓鍦暜閿熺姴鏄ラ柍鈺佸暟閻熷綊鏌涢妷锝呭闁伙附绮撳缁樼瑹閳ь剙顭囪閹囧幢濞嗘劕搴婂┑鈽嗗灟鐠€锕傛倵閼哥偣浜滈柡鍥殔娴滈箖姊洪崫鍕効缂傚秳绶氶悰顔碱潨閳ь剟銆佸☉妯滄棃鍩€椤掍胶顩查柛鎾椻偓閸嬫挾鎲撮崟顒傤槬濠电偠顕滅粻鎴﹀煝閹捐绠氱憸澶愬绩閼恒儯浜滈柡鍐ㄥ€婚幗鍌炴煟閹烘柨浜剧紒缁樼⊕瀵板嫮鈧綆鍏欓埀顒佸笧缁辨帡顢欓懖鈺佲叺閻庤娲滈崢褔鈥﹂崹顔规斀闁糕剝鐟ф闂備浇妗ㄩ悞锕傚礉濞嗗繒鏆﹂柕濞炬櫓閺佸﹪鎮规笟顖滃帥闁衡偓閵娾晜鈷掗柛灞剧懅椤︼箓鏌熺喊鍗炰簻閾荤偞绻涢幋鐐垫噮缂佺娀绠栭弻宥堫檨闁告挾鍠栧濠氬灳瀹曞洦娈曢柣搴秵閸撴稖鈪甸梻鍌欐祰椤曟牠宕伴幒妤€鐤鹃柣妯垮皺閺嗭箓鏌ㄥ┑鍡橆棞缂佸墎鍋涢埞鎴︽偐閹绘帗娈舵繛瀛樼矌閸忔ê顫忔繝姘＜婵炲棙鍔楅妶浼存⒑闂堟稒顥戦柛瀣崌濮婅櫣绮欏▎鎯у壉闂佸湱鎳撳ú銈夛綖韫囨拋娲敂瀹ュ棙娅岄梻渚€鈧偛鑻晶鎵磼椤旇姤顥堥柟顔炬櫕缁瑧鎹勯…鎺斿惞?URL')
    return
  }
  try {
    await navigator.clipboard.writeText(generatedBuilderUrl.value)
    ElMessage.success('Request URL copied')
  } catch {
    ElMessage.error('Copy failed, please copy manually')
  }
}

const runBuilderRequest = async () => {
  if (!generatedBuilderUrl.value) {
    ElMessage.warning('闂傚倸鍊搁崐鎼佸磹閹间礁纾圭€瑰嫭鍣磋ぐ鎺戠倞鐟滃繘寮抽敃鍌涚厱妞ゎ厽鍨垫禍婵嬫煕濞嗗繒绠婚柡灞稿墲瀵板嫮鈧綆浜濋鍛攽閻愬弶鈻曞ù婊勭矊濞插灝鈹戦悩顔肩伇婵炲鐩弫鍐Χ閸ヮ亜小闂侀潧顦弲婊堝煕閹达附鐓曟繝闈涙椤忣剚銇勯顒傜暤闁哄本绋掗幆鏃堝Ω閵堝棗鏋ら柣搴ゎ潐濞叉鏁埄鍐х箚闁归棿鐒﹂弲婊堟煕閹炬鑻弲顓㈡⒒閸屾瑨鍏岄柟铏崌閹椽濡搁埡鍌氫画闂侀潧顦弲婊堝磹閸洘鐓冮柛婵嗗閸ｆ椽鏌ｉ幘瀛樼闁哄瞼鍠撻埀顒傛暩椤牆鐡梻浣哥枃椤曆囨偋閹捐钃熼柨娑樺濞岊亪鏌涢幘妤€瀚崹閬嶆煟鎼淬埄鍟忛柛鐘愁殜楠炴劙鎼归锛勭畾闂佸綊妫跨粈浣告暜闂備線娼ч悧鍡椕洪敃鍌氱柧闁兼祴鏅濈壕浠嬫煕鐏炴崘澹橀柍褜鍓涢崗姗€骞冮悙鐑樻櫇闁稿本淇洪崺鐐烘⒑閻撳寒娼熼柛濠冾殕缁嬪顓兼径瀣幍闂佺顫夐崝锕傚吹濞嗘垹纾奸柣妯虹－婢ч亶鏌熼崣澶嬪€愰柟顔ㄥ洤閱囨繝闈涚墢閹冲棝姊绘担铏瑰笡闁告梹娲熼弫鍐Ψ閳轰絼锕傛煕閺囥劌鐏犵紒鐘茬－閳ь剙绠嶉崕鍗灻洪妶鍡曠箚濞寸姴顑嗛埛鎴︽煕濠靛棗顏い銉уТ閳规垿鎮欓埡浣峰濠?URL')
    return
  }
  try {
    builderRequestLoading.value = true
    const response = await axios.get(generatedBuilderUrl.value, {
      headers: {
        Accept: 'application/json',
      },
    })
    builderResponseText.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Request failed'
    builderResponseText.value = message
    ElMessage.error(message)
  } finally {
    builderRequestLoading.value = false
  }
}

const queryFilterSuggestion = (
  query: string,
  callback: (items: Array<{ value: string }>) => void,
) => {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    callback(filterSuggestionTemplates.value.slice(0, 12))
    return
  }
  const matched = filterSuggestionTemplates.value.filter((item) =>
    item.value.toLowerCase().includes(keyword),
  )
  callback(matched.slice(0, 12))
}

const queryBuilderFilterSuggestion = (
  query: string,
  callback: (items: Array<{ value: string }>) => void,
) => {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    callback(builderFilterSuggestionTemplates.value.slice(0, 12))
    return
  }
  const matched = builderFilterSuggestionTemplates.value.filter((item) =>
    item.value.toLowerCase().includes(keyword),
  )
  callback(matched.slice(0, 12))
}

watch(
  selectedEntityTypeForTryIt,
  (entityType) => {
    if (!entityType) {
      selectedFields.value = []
      selectedExpands.value = []
      filterText.value = ''
      topValue.value = 20
      return
    }
    selectedFields.value = entityType.properties.slice(0, 8).map((item) => item.name)
    selectedExpands.value = []
    filterText.value = ''
    topValue.value = 20
    tryItResponse.value = ''
  },
  { immediate: true },
)

watch(
  [selectedNodeKey, selectedEntityTypeForBuilder, selectedEntitySetForBuilder],
  ([, entityType, entitySet]) => {
    if (!entityType) {
      builderResourcePath.value = ''
      builderSelectedFields.value = []
      builderSelectedExpands.value = []
      builderFilterText.value = ''
      builderOrderByText.value = ''
      builderTopValue.value = 20
      builderSkipValue.value = 0
      builderCountValue.value = false
      builderResponseText.value = ''
      return
    }

    builderResourcePath.value = entitySet?.name ?? entityType.name
    builderSelectedFields.value = entityType.properties.slice(0, 8).map((item) => item.name)
    builderSelectedExpands.value = []
    builderFilterText.value = ''
    builderOrderByText.value = ''
    builderTopValue.value = 20
    builderSkipValue.value = 0
    builderCountValue.value = false
    builderResponseText.value = ''
  },
  { immediate: true },
)

watch(treeData, () => {
  if (!selectedNodeKey.value) {
    return
  }
  syncTreeCurrentNode(selectedNodeKey.value)
})

watch(
  selectedNodeKey,
  (key) => {
    if (!key) {
      return
    }
    syncTreeCurrentNode(key)
  },
  { flush: 'post' },
)

watch(
  selectedEntityTypeNode,
  (entityType, previousEntityType) => {
    if (!entityType) {
      resetDiagramNodeOverrides()
      if (erDialogVisible.value) {
        erDialogVisible.value = false
      }
      return
    }

    if (previousEntityType && previousEntityType.fullName === entityType.fullName) {
      return
    }

    resetDiagramNodeOverrides()
    suppressedClickNodeKey.value = ''
    if (erDialogVisible.value) {
      nextTick(() => {
        syncDiagramSize()
      })
    }
  },
)

watch(erDialogVisible, (visible) => {
  if (visible) {
    stopNodeDrag()
    resetDiagramNodeOverrides()
    suppressedClickNodeKey.value = ''
    nextTick(() => {
      startDiagramResizeObserve()
    })
    return
  }
  stopNodeDrag()
  stopDiagramResizeObserve()
})

onMounted(async () => {
  sidebarWidth.value = clampSidebarWidth(sidebarWidth.value)
  window.addEventListener('resize', handleViewportResize)
  historyUrls.value = await loadHistory()
  loadSampleMetadata()
})

onBeforeUnmount(() => {
  stopSidebarResize()
  window.removeEventListener('resize', handleViewportResize)
  stopNodeDrag()
  stopDiagramResizeObserve()
})

interface DiagramNode {
  key: string
  x: number
  y: number
  entityType: ODataEntityType
  isCenter: boolean
}

interface DiagramLine {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

interface EntityTypeRelationEdge {
  key: string
  sourceEntityTypeFullName: string
  targetEntityTypeFullName: string
  cardinality: ODataRelationCardinality
  navigationNames: string[]
}

const mergeRelationCardinality = (
  left: ODataRelationCardinality,
  right: ODataRelationCardinality,
): ODataRelationCardinality => {
  if (left === 'N:N' || right === 'N:N') {
    return 'N:N'
  }
  if (left === '1:N' || right === '1:N') {
    return '1:N'
  }
  return '1:1'
}

const centerRelationEdges = computed<EntityTypeRelationEdge[]>(() => {
  const center = erCenterEntityType.value
  if (!center || !metadataModel.value) {
    return []
  }

  const merged: Record<string, EntityTypeRelationEdge> = {}
  const appendEdge = (targetFullName: string, cardinality: ODataRelationCardinality, navigationName: string) => {
    if (targetFullName === center.fullName) {
      return
    }
    const key = `${center.fullName}->${targetFullName}`

    if (!merged[key]) {
      merged[key] = {
        key,
        sourceEntityTypeFullName: center.fullName,
        targetEntityTypeFullName: targetFullName,
        cardinality,
        navigationNames: navigationName ? [navigationName] : [],
      }
      return
    }

    merged[key].cardinality = mergeRelationCardinality(merged[key].cardinality, cardinality)
    if (navigationName && !merged[key].navigationNames.includes(navigationName)) {
      merged[key].navigationNames.push(navigationName)
    }
  }

  for (const navigation of center.navigationProperties) {
    const target = findEntityTypeByTypeRef(navigation.type)
    if (!target) {
      continue
    }
    const reverseNavigation = findReverseNavigation(center, target, navigation)
    const cardinality = resolveCardinalityFromNavigation(navigation, reverseNavigation)
    appendEdge(target.fullName, cardinality, navigation.name)
  }

  return Object.values(merged).sort((left, right) =>
    left.targetEntityTypeFullName.localeCompare(right.targetEntityTypeFullName),
  )
})

const diagramRelatedEntityTypes = computed<ODataEntityType[]>(() => {
  if (!metadataModel.value || !erCenterEntityType.value) {
    return []
  }

  const relatedFullNames = new Set<string>()
  for (const edge of centerRelationEdges.value) {
    relatedFullNames.add(edge.targetEntityTypeFullName)
  }

  const all = Array.from(relatedFullNames)
    .map((fullName) => metadataModel.value?.entityTypeMap[fullName])
    .filter((item): item is ODataEntityType => Boolean(item))
    .sort((left, right) => left.name.localeCompare(right.name))

  return all.slice(0, Math.max(1, DIAGRAM_MAX_NODES - 1))
})

const diagramOverflowCount = computed(() => {
  if (!metadataModel.value || !erCenterEntityType.value) {
    return 0
  }

  const relatedFullNames = new Set<string>()
  for (const edge of centerRelationEdges.value) {
    relatedFullNames.add(edge.targetEntityTypeFullName)
  }

  const maxOthers = Math.max(1, DIAGRAM_MAX_NODES - 1)
  return Math.max(0, relatedFullNames.size - maxOthers)
})

const autoLayoutDiagramNodes = computed<DiagramNode[]>(() => {
  const centerType = erCenterEntityType.value
  if (!centerType) {
    return []
  }

  const centerX = diagramWidth.value / 2
  const centerY = diagramHeight.value / 2
  const nodes: DiagramNode[] = [
    {
      key: entityTypeKey(centerType),
      x: centerX - diagramNodeWidth / 2,
      y: centerY - diagramNodeHeight / 2,
      entityType: centerType,
      isCenter: true,
    },
  ]

  const others = diagramRelatedEntityTypes.value
  if (!others.length) {
    return nodes
  }

  const rings = Math.ceil(others.length / 10)
  const maxRadius = Math.max(
    60,
    Math.min(
      (diagramWidth.value - diagramNodeWidth - 40) / 2,
      (diagramHeight.value - diagramNodeHeight - 40) / 2,
    ),
  )
  let consumed = 0

  for (let ringIndex = 0; ringIndex < rings; ringIndex++) {
    const remain = others.length - consumed
    const currentCount = Math.min(10, remain)
    const currentRadius = (maxRadius * (ringIndex + 1)) / rings

    for (let i = 0; i < currentCount; i++) {
      const target = others[consumed + i]
      const angle = (Math.PI * 2 * i) / currentCount - Math.PI / 2
      nodes.push({
        key: entityTypeKey(target),
        x: centerX + currentRadius * Math.cos(angle) - diagramNodeWidth / 2,
        y: centerY + currentRadius * Math.sin(angle) - diagramNodeHeight / 2,
        entityType: target,
        isCenter: false,
      })
    }

    consumed += currentCount
  }

  return nodes
})

const diagramNodes = computed<DiagramNode[]>(() =>
  autoLayoutDiagramNodes.value.map((node) => {
    const override = diagramNodePositionOverrides.value[node.key]
    if (!override) {
      return node
    }
    const position = clampDiagramPosition(override.x, override.y)
    return {
      ...node,
      x: position.x,
      y: position.y,
    }
  }),
)

const diagramLines = computed<DiagramLine[]>(() => {
  if (!centerRelationEdges.value.length || !erCenterEntityType.value) {
    return []
  }

  const nodeByEntityType = Object.fromEntries(
    diagramNodes.value.map((node) => [node.entityType.fullName, node] as const),
  )

  const lines: DiagramLine[] = []
  for (const edge of centerRelationEdges.value) {
    const sourceNode = nodeByEntityType[edge.sourceEntityTypeFullName]
    const targetNode = nodeByEntityType[edge.targetEntityTypeFullName]
    if (!sourceNode || !targetNode) {
      continue
    }

    lines.push({
      key: edge.key,
      x1: sourceNode.x + diagramNodeWidth / 2,
      y1: sourceNode.y + diagramNodeHeight / 2,
      x2: targetNode.x + diagramNodeWidth / 2,
      y2: targetNode.y + diagramNodeHeight / 2,
      label: `${edge.navigationNames.join(', ') || 'Navigation'} (${edge.cardinality})`,
    })
  }

  return lines
})
</script>

<style scoped>
.workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.page-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.connect-card {
  flex-shrink: 0;
}

.connect-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.secondary-row {
  margin-top: 12px;
  align-items: start;
}

.history-select {
  width: 100%;
}

.upload-box {
  width: 320px;
}

.workspace {
  flex: 1;
  height: 100%;
  display: grid;
  grid-template-columns: 300px 12px minmax(0, 1fr);
  gap: 0;
  min-height: 0;
}

.sidebar-card {
  min-height: 0;
}

.sidebar-resizer {
  position: relative;
  min-height: 0;
  cursor: col-resize;
}

.sidebar-resizer::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #e4e7ed;
  border-radius: 999px;
  transition: background-color 0.2s ease;
}

.sidebar-resizer:hover::before,
.sidebar-resizer.active::before {
  background: #409eff;
}

.sidebar-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.sidebar-card :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #eaf3ff;
  color: #1d4ed8;
}

.sidebar-card :deep(.el-tree-node.is-current > .el-tree-node__content .schema-tree-node-label) {
  font-weight: 600;
}

.viewer-area {
  min-height: 0;
  min-width: 0;
  display: block;
}

.viewer-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
}

.sub-title {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.schema-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.schema-tree-node-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-card {
  margin-top: 12px;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  cursor: default;
}

.option-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.alert-space {
  margin-bottom: 12px;
}

.try-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.builder-inline-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.builder-actions {
  display: flex;
  gap: 8px;
}

.diagram-toolbar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.er-diagram-content {
  height: calc(92vh - 96px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.diagram-board {
  position: relative;
  flex: 1 0 auto;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.diagram-board-scroll {
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: auto;
  display: flex;
}

.diagram-board svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.diagram-node {
  position: absolute;
  width: 190px;
  height: 72px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  padding: 10px;
  cursor: grab;
  transition: box-shadow 0.2s ease;
}

.diagram-node:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.diagram-node.dragging {
  cursor: grabbing;
}

.diagram-node.center {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgb(64 158 255 / 26%);
}

.diagram-node-title {
  font-weight: 600;
  font-size: 13px;
}

.diagram-node-type {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.er-diagram-dialog :deep(.el-dialog) {
  height: 92vh;
  display: flex;
  flex-direction: column;
}

.er-diagram-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .workspace {
    grid-template-columns: 1fr !important;
  }

  .sidebar-resizer {
    display: none;
  }

  .try-grid {
    grid-template-columns: 1fr;
  }

  .diagram-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>