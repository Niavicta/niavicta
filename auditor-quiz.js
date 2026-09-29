/* Auditor matcher: "Who do you need?"
   Shared by book.html (quiz, then booking) and other-services.html.
   NiavictaQuiz.mount(rootElement, { onBook: function(personKey, summary){...} })
   Without onBook, the result links to book.html?with=<person>#book. */
(function(){
  var QUESTIONS = [
    { kicker:'Your need', q:'What do you need help with?', options:[
      { t:'An ISO 13485 internal audit.', w:{}, need:'ISO 13485 internal audit' },
      { t:'A gap assessment before our CE mark or certification audit.', w:{}, need:'MDR / ISO 13485 gap assessment' },
      { t:'Ongoing QA/RA leadership, part-time.', w:{}, need:'Fractional QA/RA lead' },
      { t:'EUDAMED registration or regulatory work: registrations, technical documentation, regulatory strategy.', w:{j:5}, need:'EUDAMED and regulatory' },
      { t:'A supplier or contract-manufacturer audit.', w:{c:2}, need:'Supplier audit' },
      { t:'Operations: mapping how we work, or automating it.', w:{c:8}, need:'Operations assessment or automation' },
      { t:'Due diligence or a portfolio assessment, as an investor or incubator.', w:{j:5}, need:'Due diligence or portfolio readiness' },
      { t:'Training for our team.', w:{}, need:'Training' },
      { t:'Not sure yet. We want to talk it through.', w:{}, need:'Not sure yet' }
    ]},
    { kicker:'Stage', q:'Where are you right now?', options:[
      { t:'Just starting: figuring out the regulatory path and building our quality system.', w:{j:1} },
      { t:'We have a system in place and need it audited and made to actually run.', w:{c:1} }
    ]},
    { kicker:'What helps most', q:'What would help you most?', options:[
      { t:'Direction: regulatory strategy, priorities, and guidance for our leadership.', w:{j:1} },
      { t:'Delivery: run the internal audit and set up the working systems, hands-on.', w:{c:1} }
    ]},
    { kicker:'Style', q:'Who do you want in the room?', options:[
      { t:'A strategic partner who sets the direction with our leadership team.', w:{j:1} },
      { t:'A pragmatic operator who gets in and builds it with the team.', w:{c:1} }
    ]},
    { kicker:'Your product', q:'What best describes what you make?', options:[
      { t:'Software, diagnostics, or chemistry, with a heavy regulatory path.', w:{j:1} },
      { t:'Hardware, robotics, or technical systems to build and validate.', w:{c:1} }
    ]},
    { kicker:'Language', q:'Which language should the work be in?', options:[
      { t:'Dutch.', w:{j:3} },
      { t:'English.', w:{} },
      { t:'No preference.', w:{} }
    ]}
  ];

  var PEOPLE = {
    chani: {
      name:'Chani Galgut', first:'Chani', img:'dirs/img/team/chani-bw.png', email:'chani.galgut@niavicta.com',
      role:'Technical, hands-on audit · English',
      why:'You want someone who gets into the detail. Chani is the pragmatic, technical auditor: she zooms into how your operations actually run, the systems, the IT infrastructure, the warehouse, the day-to-day mechanics, and audits them where the work happens. Deep experience across autonomous robotics, implantable devices, IVDs, and combination products, and she led the first MDR certification audit in Southern Africa. She works in English.',
      certs:[
        'CQI/IRCA Certified Lead Auditor, ISO 13485:2016',
        'EU MDR Implementation, BSI',
        'MDSAP Fundamentals, TÜV SÜD',
        'ISO 13485 Clause-by-Clause, BSI',
        'Medical Device Regulations, Health Canada',
        'Good Clinical Practice (GCP), NIAID',
        'IEC 60601 Introductory',
        'M.A. International Management (Distinction); B.Sc. (Cum Laude)'
      ]
    },
    jasmine: {
      name:'Jasmine Beukema', first:'Jasmine', img:'dirs/img/team/jasmine-bw.png', email:'jasmine.beukema@niavicta.com',
      role:'Strategic direction, regulatory and EUDAMED · Dutch or English',
      why:'You are setting direction, and that is Jasmine’s strength. With close to twenty years across medical devices, from diagnostics and genomics software to autonomous robotics, she builds QA and RA at executive level and sets the regulatory strategy with your leadership team. She steered the world’s first fully autonomous robotic medical device through CE marking and FDA De Novo, and she leads our regulatory work: EUDAMED registration, technical documentation and regulatory strategy. She can run the work in Dutch or English.',
      certs:[
        'ISO 13485:2016 Lead Auditor, BSI',
        'Executive Development Program for Regulatory Affairs Professionals, Kellogg (Northwestern)',
        'Data Protection Officer (DPO), European Institute of Public Administration',
        'ISO 13485 Transition, BSI',
        'B.Sc. Economics & Logistics'
      ]
    }
  };

  function esc(s){ var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

  function mount(root, opts){
    if(!root) return;
    opts = opts || {};
    var state = { i:0, answers:[], started:false };

    function renderIntro(){
      root.innerHTML = ''
        + '<div class="mq-intro">'
        +   '<h3>Who do you need?</h3>'
        +   '<p>Six quick questions, under a minute. We match you with the right one of us, then you book a 20-minute call with them.</p>'
        +   '<button type="button" class="btn p mq-start">Start <span class="arrow"></span></button>'
        + '</div>';
      root.querySelector('.mq-start').addEventListener('click', function(){ state = { i:0, answers:[], started:true }; render(); });
    }

    function render(){
      if(!state.started) return renderIntro();
      if(state.i < 0) state.i = 0;
      if(state.i >= QUESTIONS.length) return renderResult();
      var Q = QUESTIONS[state.i];
      var pct = Math.round((state.i / QUESTIONS.length) * 100);
      var html = ''
        + '<div class="mq-progress"><i style="width:'+pct+'%"></i></div>'
        + '<div class="mq-kicker">'+esc(Q.kicker)+' · '+(state.i+1)+' of '+QUESTIONS.length+'</div>'
        + '<h2 class="mq-q">'+esc(Q.q)+'</h2>'
        + '<div class="mq-options">';
      Q.options.forEach(function(o, idx){ html += '<button type="button" class="mq-opt" data-idx="'+idx+'">'+esc(o.t)+'</button>'; });
      html += '</div><div class="mq-nav"><button type="button" class="mq-back"'+(state.i===0?' hidden':'')+'>Back</button></div>';
      root.innerHTML = html;
      Array.prototype.forEach.call(root.querySelectorAll('.mq-opt'), function(btn){
        btn.addEventListener('click', function(){ state.answers[state.i] = parseInt(btn.getAttribute('data-idx'),10); state.i++; render(); });
      });
      var back = root.querySelector('.mq-back');
      if(back) back.addEventListener('click', function(){ state.i--; render(); });
    }

    function recommended(){
      var s = { c:0, j:0 };
      state.answers.forEach(function(ai, qi){ var w = QUESTIONS[qi].options[ai].w || {}; s.c += (w.c||0); s.j += (w.j||0); });
      return s.c > s.j ? 'chani' : 'jasmine';
    }

    function summary(key){
      var need = QUESTIONS[0].options[state.answers[0]] ? QUESTIONS[0].options[state.answers[0]].need : '';
      var lines = QUESTIONS.slice(1).map(function(Q, k){ var o = Q.options[state.answers[k+1]]; return Q.kicker+': '+(o ? o.t : ''); });
      return { person:key, personName:PEOPLE[key].name, need:need, answers:lines };
    }

    function renderResult(forceKey){
      var rec = recommended();
      var key = forceKey || rec;
      var isPrimary = key === rec;
      var p = PEOPLE[key];
      var otherKey = key === 'chani' ? 'jasmine' : 'chani';
      var certs = p.certs.map(function(c){ return '<li>'+esc(c)+'</li>'; }).join('');
      var bookEl = opts.onBook
        ? '<button type="button" class="btn p mr-book">Book your call with '+esc(p.first)+' <span class="arrow"></span></button>'
        : '<a class="btn p" href="book.html?with='+key+'#book">Book your call with '+esc(p.first)+' <span class="arrow"></span></a>';
      root.innerHTML = ''
        + '<div class="mq-progress"><i style="width:100%"></i></div>'
        + '<div class="mr">'
        +   '<img src="'+p.img+'" alt="'+esc(p.name)+'">'
        +   '<div>'
        +     '<div class="mr-kicker">'+(isPrimary ? 'Great, we have your match' : 'Another option')+'</div>'
        +     '<h3>'+(isPrimary ? esc(p.first)+' is your best fit' : 'Or start with '+esc(p.first))+'</h3>'
        +     '<p class="role">'+esc(p.role)+'</p>'
        +     '<p>'+esc(p.why)+'</p>'
        +     '<details class="cert-dd"><summary>Certifications and training</summary><ul>'+certs+'</ul></details>'
        +     '<div class="mr-actions">'
        +       bookEl
        +       '<button type="button" class="mr-link" data-other="'+(isPrimary ? otherKey : rec)+'">'+(isPrimary ? 'See the other option' : 'Back to your match')+'</button>'
        +       '<button type="button" class="mr-link" data-retake="1">Retake</button>'
        +     '</div>'
        +   '</div>'
        + '</div>';
      var b = root.querySelector('.mr-book');
      if(b) b.addEventListener('click', function(){ opts.onBook(key, summary(key)); });
      root.querySelector('[data-other]').addEventListener('click', function(e){ renderResult(e.currentTarget.getAttribute('data-other')); });
      root.querySelector('[data-retake]').addEventListener('click', function(){ state = { i:0, answers:[], started:true }; render(); });
    }

    render();
  }

  window.NiavictaQuiz = { mount:mount, PEOPLE:PEOPLE };
})();
