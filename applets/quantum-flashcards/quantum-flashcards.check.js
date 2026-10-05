
const QUESTIONS = [
  {id:"d1",type:"recall",topic:"Foundations",prompt:"Define a photon.",answer:"A photon is a packet (quantum) of electromagnetic energy.",
   keyGroups:[["packet","quantum"],["electromagnetic"],["energy"]],explain:"Do not describe a photon as something carried by electromagnetic radiation; the photon is the quantum of the radiation."},

  {id:"d2",type:"recall",topic:"Photoelectric effect",prompt:"State what is meant by the photoelectric effect.",answer:"The emission of electrons from a metal surface when electromagnetic radiation is incident on it.",
   keyGroups:[["emission","emitted"],["electron"],["metal","surface"],["electromagnetic","radiation","light"]]},

  {id:"d3",type:"recall",topic:"Photoelectric effect",prompt:"Define threshold frequency.",answer:"The minimum frequency of incident electromagnetic radiation that causes photoelectron emission from the metal.",
   keyGroups:[["minimum"],["frequency"],["emission","emit"],["electron","photoelectron"]]},

  {id:"d4",type:"recall",topic:"Photoelectric effect",prompt:"Define the work function Φ of a metal.",answer:"The minimum energy required to remove an electron from the surface of the metal.",
   keyGroups:[["minimum"],["energy"],["remove","escape","emit"],["electron"],["surface","metal"]]},

  {id:"d5",type:"recall",topic:"Matter waves",prompt:"State what is meant by the de Broglie wavelength.",answer:"The wavelength associated with a moving particle.",
   keyGroups:[["wavelength"],["moving"],["particle"]]},

  {id:"d6",type:"recall",topic:"Matter waves",prompt:"What does an electron diffraction/interference pattern show about electrons?",answer:"Electrons can display wave behaviour because diffraction/interference is a wave phenomenon.",
   keyGroups:[["wave"],["diffraction","interference"]]},


  {id:"d7",type:"recall",topic:"Wave–particle duality",prompt:"What is meant by wave–particle duality?",
   answer:"Matter and electromagnetic radiation can show both wave-like and particle-like behaviour, depending on the experiment.",
   keyGroups:[["matter"],["electromagnetic","radiation","light"],["wave"],["particle"]]},

  {id:"m13",type:"mcq",topic:"Wave–particle duality",prompt:"Which observation provides direct evidence for the wave nature of electrons?",
   choices:["Electron diffraction through a crystal","The photoelectric effect","Quantisation of electric charge","Electrons producing a current in a wire"],
   correct:0,explain:"Diffraction and interference are wave phenomena, so an electron diffraction pattern is evidence that electrons can behave as waves."},

  {id:"m14",type:"mcq",topic:"Wave–particle duality",prompt:"Which observation provides evidence for the particle nature of electromagnetic radiation?",
   choices:["Diffraction of light","Interference of light","The photoelectric effect","Polarisation of light"],
   correct:2,explain:"The photoelectric effect is explained by energy arriving in discrete photons, so it supports the particle model of electromagnetic radiation."},

  {id:"m15",type:"mcq",topic:"Wave–particle duality",prompt:"Which pair of evidence is matched correctly?",
   choices:[
     "Electron diffraction → wave nature of matter; photoelectric effect → particle nature of electromagnetic radiation",
     "Electron diffraction → particle nature of matter; photoelectric effect → wave nature of electromagnetic radiation",
     "Light interference → particle nature of electromagnetic radiation; electron diffraction → particle nature of matter",
     "Photoelectric effect → wave nature of matter; polarisation → particle nature of matter"
   ],
   correct:0,explain:"Electron diffraction is wave evidence for matter; the photoelectric effect is particle evidence for electromagnetic radiation."},

  {id:"w6",type:"writing",topic:"Wave–particle duality",prompt:"State one observation showing the wave nature of matter and one showing the particle nature of electromagnetic radiation.",marks:2,
   points:[
     {label:"Electron diffraction/interference shows wave behaviour of matter.",keys:[["electron"],["diffraction","interference"]]},
     {label:"The photoelectric effect shows particle behaviour of electromagnetic radiation.",keys:[["photoelectric"],["particle","photon"]]}
   ],
   reconstruct:"electron diffraction/interference → wave nature of matter; photoelectric effect → particle nature of electromagnetic radiation",
   model:"Electron diffraction or interference provides evidence for the wave nature of matter. The photoelectric effect provides evidence for the particle nature of electromagnetic radiation."},

  {id:"e1",type:"math",topic:"Foundations",prompt:"Reproduce the photon-energy equation.",sub:"Use the mini maths editor. Either orientation is accepted.",accepted:["E=hf","hf=E"],model:"E = hf"},

  {id:"e2",type:"math",topic:"Matter waves",prompt:"Reproduce the de Broglie relation.",accepted:["λ=h/p","h/p=λ","p=h/λ","h/λ=p"],model:"λ = h/p"},

  {id:"e3",type:"math",topic:"Photoelectric effect",prompt:"Write Einstein's photoelectric equation for the maximum kinetic energy.",accepted:["hf=Φ+Ekmax","Ekmax=hf-Φ","hf=φ+Ekmax","Ekmax=hf-φ"],model:"hf = Φ + Eₖ,max"},

  {id:"e4",type:"math",topic:"Photoelectric effect",prompt:"Relate stopping potential Vₛ to the maximum kinetic energy of a photoelectron.",accepted:["Ekmax=eVs","eVs=Ekmax","Ekmax=qVs","qVs=Ekmax"],model:"Eₖ,max = eVₛ"},

  {id:"b1",type:"builder",topic:"Matter waves",prompt:"Build the expression for electron momentum after acceleration from rest through p.d. V.",
   tokens:["p","=","√(","2","m","q","V",")","h","λ"],solution:["p","=","√(","2","m","q","V",")"],model:"p = √(2mqV)",
   deriveSteps:[
     {title:"Energy gained",math:"qV = ½mv²",why:"Electrical work done on the electron becomes kinetic energy."},
     {title:"Introduce momentum",math:"p = mv  →  v = p/m",why:"Use the momentum definition so the final expression can be written in terms of p."},
     {title:"Substitute for v",math:"qV = p²/(2m)",why:"Putting v = p/m into ½mv² gives p²/(2m)."},
     {title:"Rearrange",math:"p² = 2mqV  →  p = √(2mqV)",why:"Momentum magnitude is positive, so take the positive square root."}
   ],
   explain:"Start from energy, not from memorising the final expression: qV = ½mv² and p = mv lead to p = √(2mqV)."},

  {id:"b2",type:"builder",topic:"Photoelectric effect",prompt:"Build the threshold condition for photoelectric emission.",
   tokens:["h","f₀","=","Φ","+","Eₖ,max","c","λ"],solution:["h","f₀","=","Φ"],model:"hf₀ = Φ",
   deriveSteps:[
     {title:"Start with Einstein's equation",math:"hf = Φ + Eₖ,max",why:"Photon energy is used to overcome the work function; any remainder becomes kinetic energy."},
     {title:"Apply threshold",math:"Eₖ,max = 0",why:"At the threshold frequency, emitted electrons are just able to escape."},
     {title:"Threshold condition",math:"hf₀ = Φ",why:"No energy is left over as kinetic energy at threshold."}
   ],
   explain:"At threshold the maximum kinetic energy is zero, so Einstein's equation reduces to hf₀ = Φ."},

  {id:"b3",type:"builder",topic:"Spectra",prompt:"Build the equation linking an electron energy-level transition to its photon.",
   tokens:["Δ","E","=","h","f","c","/","λ","p"],solution:["Δ","E","=","h","f"],model:"ΔE = hf",
   altSolutions:[["Δ","E","=","h","c","/","λ"]],
   deriveSteps:[
     {title:"Identify the level change",math:"ΔE = E_high − E_low",why:"The electron changes between two discrete energy levels."},
     {title:"Energy conservation",math:"E_photon = ΔE",why:"The photon carries exactly the energy lost or gained by the electron."},
     {title:"Photon relation",math:"E_photon = hf",why:"A photon of frequency f has energy hf."},
     {title:"Connect them",math:"ΔE = hf",why:"Therefore the energy-level difference fixes the photon frequency."}
   ],
   explain:"The photon energy equals the energy difference between the two electron levels, so ΔE = hf."},

  {id:"m1",type:"mcq",topic:"Matter waves",prompt:"The accelerating p.d. for electrons is increased. What happens to the diffraction rings?",
   choices:["They move further apart because the electrons move faster.","They move closer together because the de Broglie wavelength decreases.","They stay fixed because the graphite spacing is unchanged.","They disappear because faster electrons behave only as particles."],correct:1,
   explain:"Greater V → greater momentum p → smaller λ = h/p → smaller diffraction angle → closer rings.",explainKeys:[["increase","greater"],["momentum","p"],["wavelength","λ","lambda"],["closer","spacing","angle"]]},

  {id:"m2",type:"mcq",topic:"Matter waves",prompt:"A graph of p against 1/λ is a straight line through the origin. What is its gradient?",
   choices:["Planck constant h","speed of light c","electron charge e","work function Φ"],correct:0,explain:"p = h/λ = h(1/λ), so the gradient is h.",explainKeys:[["p"],["h"],["lambda","λ","wavelength"],["gradient"]]},

  {id:"m3",type:"mcq",topic:"Photoelectric effect",prompt:"Radiation is below the threshold frequency. Its intensity is doubled. What happens?",
   choices:["Electrons are emitted with twice the kinetic energy.","Electrons are emitted, but at half the rate.","No photoelectrons are emitted.","Emission begins after a short time delay."],correct:2,
   explain:"Increasing intensity increases photon number, not energy per photon. Below threshold, each photon still has insufficient energy.",explainKeys:[["below","less"],["threshold","frequency"],["photon"],["insufficient","not enough","no emission"]]},

  {id:"m4",type:"mcq",topic:"Photoelectric effect",prompt:"Above threshold, frequency increases while intensity is kept constant. Which statement is correct?",
   choices:["Maximum photoelectron kinetic energy increases.","Maximum photoelectron kinetic energy decreases.","Work function increases.","Threshold frequency increases."],correct:0,
   explain:"Eₖ,max = hf − Φ. Φ and f₀ are properties of the metal.",explainKeys:[["frequency","f"],["kinetic","energy"],["increase","greater"],["hf","photon"]]},

  {id:"m5",type:"mcq",topic:"Spectra",prompt:"Why does one particular downward atomic transition produce one spectral frequency?",
   choices:["Every electron travels at the same speed.","The level separation is fixed, so ΔE is fixed and ΔE = hf.","The atom emits all frequencies but only one survives.","The photon loses energy while leaving the atom."],correct:1,
   explain:"Discrete energy levels give fixed ΔE; one fixed photon energy means one fixed frequency.",explainKeys:[["fixed","discrete"],["energy","gap","difference"],["hf","frequency"]]},

  {id:"m6",type:"mcq",topic:"Spectra",prompt:"A dark absorption line is seen after white light passes through a cool gas. Where did that energy go?",
   choices:["It was permanently destroyed in the atom.","It becomes only kinetic energy of the whole atom.","The photon was absorbed and later re-emitted, usually in another direction.","It is converted into a lower-frequency photon in every case."],correct:2,
   explain:"The excited electron de-excites and re-emits; only a small fraction is sent back towards the original observer.",explainKeys:[["absorbed","absorb"],["re-emitted","reemitted","emitted"],["direction"],["weaker","dark","intensity"]]},

  {id:"m10",type:"mcq",topic:"Photoelectric effect",prompt:"On a graph of stopping potential Vₛ against frequency f, what does the gradient represent?",
   choices:["h/e","e/h","−Φ/e","hc"],correct:0,explain:"eVₛ = hf − Φ → Vₛ = (h/e)f − Φ/e.",explainKeys:[["gradient"],["h"],["e"],["h/e"]]},

  {id:"m11",type:"mcq",topic:"Photoelectric effect",prompt:"On the same Vₛ–f graph, what does the frequency-axis intercept represent?",
   choices:["The work function directly","The threshold frequency","The maximum kinetic energy","The saturation current"],correct:1,explain:"At Vₛ = 0, hf = Φ, so f = f₀.",explainKeys:[["intercept"],["threshold"],["frequency","f0"]]},

  {id:"m12",type:"mcq",topic:"Foundations",prompt:"Which statement about a photon is most precise?",
   choices:["A particle carried inside an electromagnetic wave.","A packet of electromagnetic energy.","A packet of electrons released by light.","A small wave with a fixed wavelength."],correct:1,
   explain:"Cambridge wording requires the photon itself to be a packet/quantum of electromagnetic energy.",explainKeys:[["packet","quantum"],["electromagnetic"],["energy"]]},

  {id:"w1",type:"writing",topic:"Spectra",prompt:"Explain how a line emission spectrum provides evidence for discrete electron energy levels in atoms.",marks:3,
   points:[
    {label:"Each line corresponds to photons of a specific energy.",keys:[["line"],["photon"],["energy"]]},
    {label:"A photon is emitted when an electron changes to a lower energy level.",keys:[["photon"],["emit"],["electron"],["level"]]},
    {label:"Discrete photon-energy changes imply discrete electron energy levels.",keys:[["discrete"],["energy"],["level"]]}
   ],
   reconstruct:"specific photon energy → electron changes level → discrete energy levels",
   model:"Each line in an emission spectrum corresponds to photons of a particular frequency and therefore a specific energy, E = hf. These photons are emitted when electrons de-excite from a higher energy level to a lower energy level. The photon energy equals the energy difference between the two levels, showing that electron energy levels are discrete."},

  {id:"w2",type:"writing",topic:"Spectra",prompt:"White light passes through cool hydrogen gas and dark lines appear. Explain why.",marks:3,
   points:[
    {label:"A photon is absorbed by an electron.",keys:[["photon"],["absorb"],["electron"]]},
    {label:"Its energy equals the difference between two energy levels.",keys:[["energy"],["difference","gap"],["level"]]},
    {label:"On de-excitation, a photon is emitted in any direction.",keys:[["emit","re-emit"],["direction"]]}
   ],
   reconstruct:"photon absorbed → energy matches level gap → re-emitted in any direction",
   model:"A photon is absorbed by an electron, exciting it to a higher energy level. The photon energy equals the difference between the two electron energy levels. When the electron de-excites, the photon is emitted in any direction, reducing the intensity of the transmitted beam at that wavelength, as evident by a dark line on the visible spectrum."},

  {id:"w3",type:"writing",topic:"Spectra",prompt:"A transmitted spectrum from white light through cool gas has thin dark lines. Give a full 4-mark explanation.",marks:4,
   points:[
    {label:"Photon absorbed and electron excited.",keys:[["photon"],["absorb"],["electron"],["excite"]]},
    {label:"Photon energy equals an energy-level difference.",keys:[["energy"],["difference","gap"],["level"]]},
    {label:"A fixed photon energy corresponds to one frequency/wavelength.",keys:[["frequency","wavelength"],["energy"]]},
    {label:"The photon is later emitted in any direction.",keys:[["emit","re-emit"],["direction"]]}
   ],
   reconstruct:"absorbed/excited → level gap → one frequency or wavelength → re-emitted in any direction",
   model:"A photon is absorbed by an electron, exciting it to a higher energy level. The photon energy equals the difference between the two electron energy levels. Since the energy levels are discrete, only particular photon frequencies or wavelengths are absorbed. When the electron de-excites, the photon is emitted in any direction, reducing the intensity of the transmitted beam at that wavelength, as evident by a dark line on the visible spectrum."},

  {id:"w4",type:"writing",topic:"Photoelectric effect",prompt:"Explain why the existence of a threshold frequency supports the photon model of electromagnetic radiation.",marks:3,
   points:[
    {label:"An electron needs a minimum energy to escape the metal.",keys:[["electron"],["minimum"],["energy"],["escape","emit","leave"]]},
    {label:"One electron absorbs one photon/packet whose energy depends on frequency.",keys:[["photon","packet","quantum"],["energy"],["frequency"]]},
    {label:"Below f₀ each photon has insufficient energy; intensity cannot compensate.",keys:[["below","less"],["threshold","f0","frequency"],["insufficient","enough"]]}
   ],
   reconstruct:"minimum escape energy → photon energy hf → below f₀ one photon is insufficient",
   model:"An electron must receive at least the work-function energy to escape. Radiation is absorbed in photons, each with energy hf. Below the threshold frequency, one photon does not have enough energy to release an electron, even if the intensity is increased."},

  {id:"w5",type:"writing",topic:"Matter waves",prompt:"Explain why increasing the accelerating p.d. makes electron-diffraction rings closer together.",marks:3,
   points:[
    {label:"Greater p.d. gives the electrons greater momentum.",keys:[["potential","p.d","voltage"],["momentum"],["greater","increase"]]},
    {label:"Since λ = h/p, the de Broglie wavelength decreases.",keys:[["lambda","λ","wavelength"],["h/p","de broglie"],["decrease","smaller"]]},
    {label:"Smaller wavelength gives smaller diffraction angle / ring spacing.",keys:[["diffraction"],["angle","spacing","rings"],["smaller","closer","decrease"]]}
   ],
   reconstruct:"V ↑ → p ↑ → λ ↓ → diffraction angle ↓ → rings closer",
   model:"A larger accelerating p.d. gives the electrons greater momentum. Since λ = h/p, their de Broglie wavelength decreases. For the same crystal spacing this gives a smaller diffraction angle, so the rings are closer together."},

  {id:"n1",type:"numeric",topic:"Matter waves",prompt:"An electron moves at 4.9 × 10⁷ m s⁻¹. Calculate its de Broglie wavelength.",answer:1.486e-11,tol:.03,unit:"m",display:"1.49 × 10⁻¹¹ m",
   steps:[
    {label:"1 · Equation",html:"<span class='mathline'>λ = <span class='frac'><span>h</span><span>mv</span></span></span>"},
    {label:"2 · Substitute",html:"<span class='mathline'>λ = <span class='frac'><span>6.63 × 10<sup>−34</sup></span><span>(9.11 × 10<sup>−31</sup>)(4.9 × 10<sup>7</sup>)</span></span></span>"},
    {label:"3 · Answer",html:"<span class='mathline'>λ = 1.49 × 10<sup>−11</sup> m</span>"}
   ],
   workTarget:"λ=h/(mv) → substitute h, m and v → 1.49 × 10⁻¹¹ m",
   explain:"Use λ = h/(mv). Keep the electron mass and speed together in the denominator."},

  {id:"n2",type:"numeric",topic:"Spectra",prompt:"Convert the hydrogen ground-state energy −13.6 eV to joules.",answer:-2.176e-18,tol:.025,unit:"J",display:"−2.18 × 10⁻¹⁸ J",
   steps:[
    {label:"1 · Conversion",html:"<span class='mathline'>1 eV = 1.60 × 10<sup>−19</sup> J</span>"},
    {label:"2 · Multiply",html:"<span class='mathline'>E = (−13.6)(1.60 × 10<sup>−19</sup>)</span>"},
    {label:"3 · Answer",html:"<span class='mathline'>E = −2.18 × 10<sup>−18</sup> J</span>"}
   ],
   workTarget:"−13.6 × 1.60 × 10⁻¹⁹ → −2.18 × 10⁻¹⁸ J",
   explain:"The negative sign remains because the bound-state energy is below the zero-energy reference."},

  {id:"n3",type:"numeric",topic:"Photoelectric effect",prompt:"If the work function is 5.8 × 10⁻¹⁹ J, calculate the threshold frequency.",answer:8.748e14,tol:.025,unit:"Hz",display:"8.75 × 10¹⁴ Hz",
   steps:[
    {label:"1 · Threshold condition",html:"<span class='mathline'>hf<sub>0</sub> = Φ</span>"},
    {label:"2 · Rearrange",html:"<span class='mathline'>f<sub>0</sub> = <span class='frac'><span>Φ</span><span>h</span></span></span>"},
    {label:"3 · Substitute",html:"<span class='mathline'>f<sub>0</sub> = <span class='frac'><span>5.8 × 10<sup>−19</sup></span><span>6.63 × 10<sup>−34</sup></span></span></span>"},
    {label:"4 · Answer",html:"<span class='mathline'>f<sub>0</sub> = 8.75 × 10<sup>14</sup> Hz</span>"}
   ],
   workTarget:"hf₀=Φ → f₀=Φ/h → 8.75 × 10¹⁴ Hz",
   explain:"At threshold the emitted electron has zero maximum kinetic energy."},

  {id:"s1",type:"sketch",topic:"Photoelectric effect",prompt:"Sketch Eₖ,max against frequency f for the photoelectric effect.",sub:"Include what happens below threshold, the threshold point, and the shape above threshold.",
   checklist:["Eₖ,max = 0 below f₀","line begins at f₀ on the frequency axis","straight line of positive gradient above f₀"],modelKind:"photoGraph"},

  {id:"s2",type:"sketch",topic:"Spectra",prompt:"From memory, sketch a simple energy-level diagram showing absorption and emission.",sub:"Include two discrete levels, an upward absorption arrow and a downward emission arrow labelled with photon energy.",
   checklist:["two discrete horizontal energy levels","upward arrow for absorption","downward arrow for emission","ΔE = hf or equivalent label"],modelKind:"levels"}

];


const QUICK_CHECKS = {
  d1:{kind:"choice",q:"Which definition is complete?",options:["A packet of electromagnetic energy.","A particle carried inside an electromagnetic wave.","A packet of energy released only by electrons."],answer:0},
  d2:{kind:"choice",q:"Which statement correctly defines the photoelectric effect?",options:["Electrons absorb photons but remain in the metal.","Electrons are emitted from a metal surface when electromagnetic radiation is incident.","Light is emitted when electrons fall to lower energy levels."],answer:1},
  d3:{kind:"choice",q:"Threshold frequency is…",options:["the frequency giving the greatest photoelectron kinetic energy.","the minimum incident frequency that causes electron emission.","the frequency at which saturation current is reached."],answer:1},
  d4:{kind:"choice",q:"The work function Φ is…",options:["the maximum kinetic energy of an emitted electron.","the minimum energy needed to remove an electron from the metal surface.","the energy of every photon incident on a metal."],answer:1},
  d5:{kind:"choice",q:"The de Broglie wavelength is the wavelength associated with…",options:["any stationary charged particle.","a moving particle.","only an electron moving at the speed of light."],answer:1},
  d6:{kind:"choice",q:"Why does an electron diffraction pattern matter?",options:["Diffraction is characteristic of waves, so electrons can show wave behaviour.","It proves electrons have no mass.","It proves electrons are electromagnetic radiation."],answer:0},

  e1:{kind:"choice",q:"A photon's frequency is doubled. What happens to its energy?",options:["It doubles.","It halves.","It stays the same."],answer:0,hint:"Use the proportionality in E = hf. Which quantities are constants?"},
  e2:{kind:"choice",q:"A particle's momentum doubles. What happens to its de Broglie wavelength?",options:["It doubles.","It halves.","It stays the same."],answer:1,hint:"Look at where p appears in λ = h/p."},
  e3:{kind:"choice",q:"For the same metal, the incident frequency increases above threshold. What happens to Eₖ,max?",options:["It increases.","It decreases.","It stays constant because Φ is fixed."],answer:0,hint:"Rearrange Einstein's equation as Eₖ,max = hf − Φ."},
  e4:{kind:"choice",q:"If the maximum photoelectron kinetic energy doubles, what happens to the stopping potential?",options:["It doubles.","It halves.","It stays unchanged."],answer:0,hint:"e is constant in Eₖ,max = eVₛ."},

  b1:{kind:"choice",q:"The accelerating p.d. V is increased by a factor of 4. By what factor does electron momentum increase?",options:["2","4","16"],answer:0,hint:"From p = √(2mqV), focus on the square-root dependence on V."},
  b2:{kind:"choice",q:"A metal has twice the work function. What happens to its threshold frequency?",options:["It doubles.","It halves.","It is unchanged."],answer:0,hint:"At threshold, hf₀ = Φ and h is constant."},
  b3:{kind:"choice",q:"A transition has a larger energy-level gap. What happens to the emitted photon's frequency?",options:["It increases.","It decreases.","It is unchanged."],answer:0,hint:"Use ΔE = hf with h constant."},

  m1:{kind:"choice",q:"Why do the diffraction rings move closer together?",options:["Greater V gives greater p; λ = h/p therefore decreases.","Greater V makes the graphite spacing smaller.","Greater V makes electrons stop behaving as waves."],answer:0,hint:"Start with what increasing accelerating p.d. does to momentum, then use λ = h/p."},
  m2:{kind:"choice",q:"On the p against 1/λ graph, 1/λ doubles. What happens to p?",options:["p doubles.","p halves.","p stays constant."],answer:0,hint:"The graph is a straight line through the origin: p = h(1/λ)."},
  m3:{kind:"choice",q:"Why doesn't doubling intensity below threshold cause emission?",options:["Each photon still has insufficient energy hf.","The metal's work function doubles.","The incident photons lose all momentum."],answer:0,hint:"Intensity changes photon number, not the energy hf of each photon."},
  m4:{kind:"choice",q:"Why does Eₖ,max increase when frequency increases above threshold?",options:["Eₖ,max = hf − Φ","The work function decreases with frequency.","More photons always means more energy per electron."],answer:0,hint:"For one metal, Φ is fixed. Focus on the hf term."},
  m5:{kind:"choice",q:"Why does one transition give one spectral frequency?",options:["A fixed level gap gives a fixed photon energy, and E = hf.","Every electron moves at the same speed.","The atom filters out all other frequencies after emission."],answer:0,hint:"A single transition has one fixed ΔE. Connect that to hf."},
  m6:{kind:"choice",q:"Why is the transmitted beam dark at that wavelength?",options:["The photon is destroyed permanently.","Photons are absorbed and later re-emitted in many directions, so fewer continue towards the observer.","The gas changes every absorbed photon into a lower-frequency photon."],answer:1,hint:"The absorbed energy is not destroyed. Think about what happens when the excited electron drops back down."},
  m10:{kind:"choice",q:"A second metal has a larger work function Φ. On a Vₛ-against-f graph, what changes?",options:["The gradient increases.","The gradient stays h/e, but the threshold-frequency intercept moves to a higher f.","Both gradient and threshold frequency stay unchanged."],answer:1,hint:"Separate the gradient h/e from the intercept terms containing Φ."},
  m11:{kind:"choice",q:"The work function of the metal increases. What happens to the frequency-axis intercept f₀?",options:["It moves to a higher frequency.","It moves to a lower frequency.","It stays fixed."],answer:0,hint:"At the x-intercept, f₀ = Φ/h."},
  m12:{kind:"multi",q:"Tick every phrase that belongs in a precise photon definition.",options:["packet / quantum","electromagnetic","energy","electron released from a metal"],answers:[0,1,2],hint:"A precise definition needs all three ideas: packet/quantum, electromagnetic, energy."},

  w1:{kind:"order",q:"Put the scoring chain in order.",steps:["spectral line → specific photon energy","photon emitted when electron changes level","discrete energy changes → discrete levels"],hint:"Start with a spectral line and work backwards: photon energy → transition → discreteness."},
  w2:{kind:"order",q:"Put the absorption-line explanation in order.",steps:["photon absorbed by electron","photon energy matches an energy-level gap","electron de-excites and photon is re-emitted in any direction"],hint:"The final mark is usually the direction of the re-emitted photon."},
  w3:{kind:"order",q:"Put the full 4-mark chain in order.",steps:["photon absorbed and electron excited","photon energy equals a level gap","one energy fixes one frequency / wavelength","photon is re-emitted in any direction"],hint:"Remember the extra link explaining why the gap is a thin line: one energy corresponds to one frequency/wavelength."},
  w4:{kind:"order",q:"Put the threshold-frequency argument in order.",steps:["electron needs a minimum energy to escape","each photon has energy hf","below f₀ one photon has insufficient energy"],hint:"Separate photon energy from intensity: only hf changes with frequency."},
  w5:{kind:"order",q:"Put the diffraction reasoning in order.",steps:["V increases → electron momentum increases","λ = h/p → wavelength decreases","diffraction angle decreases → rings move closer"],hint:"Follow the causal chain V → p → λ → diffraction angle."},

  n1:{kind:"choice",q:"For electrons of the same mass, the speed doubles. What happens to the de Broglie wavelength?",options:["It doubles.","It halves.","It stays the same."],answer:1,hint:"For fixed m, λ = h/(mv) is inversely proportional to v."},
  n2:{kind:"choice",q:"A bound-state energy is −3.0 eV. After converting to joules, what happens to the sign?",options:["It stays negative.","It becomes positive.","The sign is removed because joules cannot be negative."],answer:0,hint:"Changing units does not change whether the energy is above or below the chosen zero level."},
  n3:{kind:"choice",q:"The work function increases by 20%. What happens to the threshold frequency?",options:["It increases by 20%.","It decreases by 20%.","It increases by 40%."],answer:0,hint:"f₀ = Φ/h is a direct proportionality."},

  s1:{kind:"choice",q:"A metal with a larger work function is used. What happens to the Eₖ,max-against-f graph?",options:["The gradient becomes steeper.","The gradient stays h, but the threshold frequency shifts right.","The graph becomes curved."],answer:1,hint:"Φ affects the intercept/threshold; h sets the gradient."},
  s2:{kind:"multi",q:"Which features should your energy-level sketch include?",options:["discrete horizontal energy levels","upward absorption arrow","downward emission arrow","Δ E = hf or equivalent","a continuous sloping energy band"],answers:[0,1,2,3],hint:"Energy levels are discrete, and absorption/emission should show opposite transition directions."},
  d7:{kind:"choice",q:"Which statement best describes wave–particle duality?",options:["Matter is always particle-like and light is always wave-like.","Matter and electromagnetic radiation can show wave-like or particle-like behaviour depending on the experiment.","Every quantum object is physically half wave and half particle at the same time."],answer:1,hint:"Think about what different experiments reveal, rather than assigning a permanent label."},
  m13:{kind:"choice",q:"Which additional observation would also support wave behaviour?",options:["An interference pattern.","A threshold frequency.","A single localised collision."],answer:0,hint:"Look for another phenomenon that requires superposition of waves."},
  m14:{kind:"choice",q:"Which statement is most closely linked to the particle model of light?",options:["Energy is transferred in discrete photons.","Light spreads around obstacles.","Light can form interference fringes."],answer:0,hint:"The particle model is about discrete packets of energy."},
  m15:{kind:"multi",q:"Tick the two correct evidence links.",options:["Electron diffraction → wave nature of matter","Photoelectric effect → particle nature of electromagnetic radiation","Light interference → particle nature of electromagnetic radiation","Electron diffraction → particle nature of matter"],answers:[0,1],hint:"One link is wave evidence for matter; the other is particle evidence for radiation."},
  w6:{kind:"order",q:"Build the two-part evidence statement.",steps:["electron diffraction/interference → wave nature of matter","photoelectric effect → particle nature of electromagnetic radiation"],hint:"There are two independent examples: one for matter, one for electromagnetic radiation."},
};

const BRIEF_TITLES = {"w6":"Duality evidence","m15":"Evidence for duality","m14":"Particle nature of light","m13":"Wave nature of electrons","d7":"Wave\u2013particle duality","d1": "Photon definition", "d2": "Photoelectric effect", "d3": "Threshold frequency", "d4": "Work function", "d5": "de Broglie wavelength", "d6": "Electron diffraction", "e1": "Photon energy equation", "e2": "de Broglie equation", "e3": "Einstein photoelectric equation", "e4": "Stopping potential", "b1": "Momentum after acceleration", "b2": "Threshold condition", "b3": "Atomic transition & photon", "m1": "Electron diffraction rings", "m2": "Planck constant from a graph", "m3": "Intensity below threshold", "m4": "Frequency & photoelectron energy", "m5": "Why spectral lines have one frequency", "m6": "Why absorption lines are dark", "m10": "Stopping-potential gradient", "m11": "Threshold-frequency intercept", "m12": "Precise photon definition", "w1": "Emission spectrum & discrete levels", "w2": "Absorption lines in hydrogen", "w3": "Full absorption-spectrum explanation", "w4": "Threshold frequency as photon evidence", "w5": "Electron diffraction reasoning", "n1": "de Broglie calculation", "n2": "Convert eV to joules", "n3": "Threshold-frequency calculation", "s1": "Photoelectric graph", "s2": "Energy-level diagram"};

const REVISE_REASONING = {
  e1:`<b>Why?</b> A photon has energy <span class="mathline">E = hf</span>, so photon energy is directly proportional to frequency.`,
  e2:`<b>Why?</b> The de Broglie relation is <span class="mathline">λ = <span class="frac"><span>h</span><span>p</span></span></span>. Greater momentum therefore means a smaller wavelength.`,
  e3:`<b>Why?</b> Energy conservation gives <span class="mathline">hf = Φ + Eₖ,max</span>. For one metal, Φ is fixed, so increasing f increases Eₖ,max.`,
  e4:`<b>Why?</b> The stopping field removes the maximum kinetic energy: <span class="mathline">Eₖ,max = eVₛ</span>. Therefore Vₛ is proportional to Eₖ,max.`,
  m2:`<b>Graph reasoning</b><br><span class="mathline">p = <span class="frac"><span>h</span><span>λ</span></span> = h(1/λ)</span>.<br>Compare with <b>y = mx</b>: plotting p on the y-axis against 1/λ on the x-axis gives gradient <b>h</b>.`,
  m10:`<b>Graph reasoning</b><br><span class="mathline">eVₛ = hf − Φ</span><br><span class="mathline">Vₛ = (h/e)f − Φ/e</span><br>Compare with <b>y = mx + c</b>: gradient = <b>h/e</b>, y-intercept = <b>−Φ/e</b>, and the frequency-axis intercept is <b>f₀ = Φ/h</b>.`,
  m11:`<b>Graph reasoning</b><br>At the frequency-axis intercept, <span class="mathline">Vₛ = 0</span>. So <span class="mathline">hf = Φ</span>, meaning <span class="mathline">f = f₀ = Φ/h</span>.`,
  n1:`<b>Proportionality check</b><br><span class="mathline">λ = h/(mv)</span>. For a fixed particle mass, λ is inversely proportional to speed.`,
  n3:`<b>Threshold reasoning</b><br><span class="mathline">hf₀ = Φ</span>, so <span class="mathline">f₀ = Φ/h</span>. The threshold frequency is directly proportional to work function.`,
  s1:`<b>Graph reasoning</b><br>Above threshold, <span class="mathline">Eₖ,max = hf − Φ</span>. The graph is a straight line of gradient h beginning at the threshold frequency f₀. A larger Φ shifts f₀ to a higher frequency but does not change the gradient.`,
  d7:`<b>Key idea</b> Wave–particle duality does not mean an object is “half wave, half particle”. Different experiments reveal wave-like or particle-like behaviour.`,
  m13:`<b>Why?</b> Diffraction and interference are characteristic wave phenomena. Observing them with electrons is evidence for wave behaviour of matter.`,
  m14:`<b>Why?</b> The photoelectric effect requires energy to be transferred in discrete photons, supporting the particle model of electromagnetic radiation.`,
  m15:`<b>Link the evidence</b> Electron diffraction/interference → wave nature of matter. Photoelectric effect → particle nature of electromagnetic radiation.`,
  w6:`<b>Two pieces of evidence</b> Electron diffraction/interference is wave evidence for matter; the photoelectric effect is particle evidence for electromagnetic radiation.`
};

const TYPE_NAMES={recall:"Typed recall",math:"Equation",builder:"Equation builder",mcq:"MCQ",writing:"Exam writing",numeric:"Calculation",sketch:"Dual coding"};
const $=s=>document.querySelector(s);
let mode="revise",queue=[],index=0,current=null,session=[],streak=0,bestStreak=Number(localStorage.getItem("qr_bestStreak")||0);
let builderState=[],selectedMCQ=null,drawing=null,revisePhase="think",audioCtx=null,musicTimer=null,musicStep=0;
const mastery=JSON.parse(localStorage.getItem("qr_mastery")||"{}");
const TEACHER=atob("dmlwdXRAcnVnYnlzY2hvb2wuYWMudGg=");

function topics(){return [...new Set(QUESTIONS.map(q=>q.topic))].sort()}
function topicCounts(){
  const out={};QUESTIONS.forEach(q=>out[q.topic]=(out[q.topic]||0)+1);return out;
}
function buildTopicCounts(){
  const counts=topicCounts(), total=QUESTIONS.length;
  const html=[`<span class="topicCount"><b>${total}</b> cards total</span>`]
    .concat(Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0])).map(([t,n])=>`<span class="topicCount">${t}: <b>${n}</b></span>`)).join("");
  $("#landingTopicCounts").innerHTML=html;
}
function buildJumpTopics(){
  const s=$("#jumpTopic");if(!s)return;
  s.innerHTML='<option value="all">All topics</option>';
  topics().forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=`${t} (${topicCounts()[t]})`;s.appendChild(o)});
  buildJumpCards();
}
function buildJumpCards(){
  const topic=$("#jumpTopic")?.value||"all", s=$("#jumpCard");if(!s)return;
  s.innerHTML="";
  queue.forEach((q,i)=>{
    if(topic!=="all"&&q.topic!==topic)return;
    const o=document.createElement("option");o.value=i;o.textContent=`${i+1}. ${shortPrompt(q.prompt)}`;if(i===index)o.selected=true;s.appendChild(o)
  });
  $("#deckCountNote").textContent=`${queue.length} cards in this ${mode==="revise"?"revision":"test"} session.`;
}
function shortPrompt(s){return s.length>52?s.slice(0,49)+"…":s}

function questionBrief(q){return BRIEF_TITLES[q.id]||shortPrompt(q.prompt)}
function buildNavMenu(){
  const host=$("#navMenuGrid"); if(!host)return; host.innerHTML="";
  topics().forEach(topic=>{
    const group=document.createElement("div");group.className="navGroup";
    group.innerHTML=`<h4>${topic} · ${QUESTIONS.filter(q=>q.topic===topic).length} cards</h4>`;
    QUESTIONS.filter(q=>q.topic===topic).forEach(q=>{
      const b=document.createElement("button");b.className="navQuestion"+(current&&current.id===q.id?" active":"");
      b.textContent=questionBrief(q);b.onclick=()=>navigateToQuestionId(q.id);group.appendChild(b);
    });
    host.appendChild(group);
  });
}
function navigateToQuestionId(id){
  const q=QUESTIONS.find(x=>x.id===id);if(!q)return;
  let i=queue.findIndex(x=>x.id===id);
  if(i<0){queue.splice(index+1,0,q);i=index+1}
  index=i;$("#navMenu").hidden=true;render();
}
function toggleNavMenu(){buildNavMenu();$("#navMenu").hidden=!$("#navMenu").hidden}

function jumpToSelected(){const v=Number($("#jumpCard").value);if(Number.isInteger(v)){index=v;render()}}
function jumpRelative(delta){if(!queue.length)return;index=Math.max(0,Math.min(queue.length-1,index+delta));render()}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function textNorm(s){return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}λφ₀ₖ]+/gu," ")}
function groupHit(txt,group){const t=textNorm(txt);return group.some(k=>t.includes(textNorm(k).trim()))}
function keysScore(txt,groups){return groups.filter(g=>groupHit(txt,g)).length}
function norm(s){
  return String(s||"").toLowerCase().replace(/\\phi/g,"φ").replace(/\\lambda/g,"λ").replace(/\\delta/g,"δ")
    .replace(/\\mathrm\{max\}/g,"max").replace(/_\{?([^}]+)\}?/g,"$1").replace(/\s+/g,"").replace(/[(){}]/g,"")
    .replace(/phi/g,"φ").replace(/lambda/g,"λ").replace(/ek,max|ekmax|kmax/g,"ekmax").replace(/v_s/g,"vs").replace(/f_0/g,"f0");
}
function prettyMath(s){return (s||"").replace(/lambda|\\lambda/gi,"λ").replace(/phi|\\phi/gi,"Φ").replace(/delta|\\Delta/gi,"Δ").replace(/Ek,max|Ekmax/gi,"Eₖ,max").replace(/Vs/g,"Vₛ").replace(/f0/g,"f₀")}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function formatMathPreview(raw){
  let s=prettyMath(raw||"").trim();
  if(!s)return "…";
  // Explicit \frac{a}{b}
  s=s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,(_,a,b)=>`<span class="frac"><span>${escapeHTML(a)}</span><span>${escapeHTML(b)}</span></span>`);
  // Simple single slash fractions, e.g. h/p or Φ/h
  if(!s.includes("<span") && /^[^=]+=[^/]+\/[^/]+$/.test(s)){
    const [lhs,rhs]=s.split("=");
    const k=rhs.indexOf("/");
    return `<span class="mathline">${escapeHTML(lhs)} = <span class="frac"><span>${escapeHTML(rhs.slice(0,k))}</span><span>${escapeHTML(rhs.slice(k+1))}</span></span></span>`;
  }
  if(!s.includes("<span") && /^[^/]+\/[^/]+$/.test(s)){
    const k=s.indexOf("/");
    return `<span class="mathline"><span class="frac"><span>${escapeHTML(s.slice(0,k))}</span><span>${escapeHTML(s.slice(k+1))}</span></span></span>`;
  }
  return `<span class="mathline">${s}</span>`;
}
function init(){
  topics().forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t;$("#topicFilter").appendChild(o)});
  $("#studentName").value=localStorage.getItem("qr_name")||"";
  $("#studentName").oninput=e=>localStorage.setItem("qr_name",e.target.value);
  buildTopicCounts();
  buildJumpTopics();
  $("#jumpTopic").onchange=buildJumpCards;
  $("#jumpCard").onchange=jumpToSelected;
  $("#prevCard").onclick=()=>jumpRelative(-1);
  $("#nextCard").onclick=()=>jumpRelative(1);
  $("#cardPrev").onclick=()=>jumpRelative(-1);
  $("#cardNext").onclick=()=>jumpRelative(1);
  $("#navMenuBtn").onclick=toggleNavMenu;
  $("#closeNavMenu").onclick=()=>$("#navMenu").hidden=true;
  $("#startRevise").onclick=()=>start("revise");
  $("#startTest").onclick=()=>start("test");
  $("#exitBtn").onclick=exitStudy;
  $("#homeBtn").onclick=()=>{window.location.href="../index.html"};
  $("#fullscreenBtn").onclick=enterFullscreen;
  $("#musicBtn").onclick=toggleMusic;
  $("#shareBtn").onclick=openSummary;$("#shareTop").onclick=openSummary;
  $("#socialShareBtn").onclick=shareResultGraphic;
  $("#socialShareSummary").onclick=shareResultGraphic;
  $("#closeSummary").onclick=()=>$("#summaryOverlay").hidden=true;
  $("#emailSummary").onclick=emailSummary;
  $("#copySummary").onclick=async()=>{try{await navigator.clipboard.writeText(summaryText());$("#copySummary").textContent="Copied ✓";setTimeout(()=>$("#copySummary").textContent="Copy",1000)}catch(e){}};
}
function start(m){
  mode=m;document.body.dataset.studyMode=m;
  $("#modeTitle").textContent=m==="revise"?"Revise mode":"Test mode";
  $("#landing").hidden=true;$("#studyShell").hidden=false;
  stopMusic();
  buildQueue();
}
function exitStudy(){stopMusic();$("#studyShell").hidden=true;$("#landing").hidden=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
function enterFullscreen(){const el=$("#studyShell");if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen().catch(()=>{})}
function buildQueue(){
  let pool=QUESTIONS.filter(q=>$("#topicFilter").value==="all"||q.topic===$("#topicFilter").value);
  if(mode==="revise") queue=shuffle(pool).sort((a,b)=>(mastery[a.id]??2)-(mastery[b.id]??2));
  else queue=shuffle(pool).slice(0,Math.min(Number($("#testLength").value),pool.length));
  index=0;session=[];streak=0;render();buildJumpCards();
}

function updateCarousel(){
  $("#cardPrev").disabled=index<=0;
  $("#cardNext").disabled=index>=queue.length-1;
}

function render(){
  current=queue[index];
  if(!current){finish();return}
  revisePhase="think";builderState=[];selectedMCQ=null;
  $("#typeBadge").textContent=TYPE_NAMES[current.type]||current.type;
  $("#topicBadge").textContent=current.topic;
  $("#currentBrief").textContent=questionBrief(current);
  $("#currentTopic").textContent=current.topic;
  $("#counter").textContent=`${index+1} / ${queue.length}`;
  $("#prompt").textContent=current.prompt;
  $("#subprompt").textContent=current.sub||"";
  $("#progress").style.width=`${index/Math.max(queue.length,1)*100}%`;
  if(mode==="revise")renderReviseThink();else renderTest();
  updateStats();buildJumpCards();updateCarousel();buildNavMenu();
}
function renderReviseThink(){
  $("#workspace").innerHTML=`<div class="centerReveal"><button class="revealBtn" id="revealBtn">Reveal answer</button></div>`;
  $("#revealBtn").onclick=revealRevisionAnswer;
}
function answerForRevision(q){
  if(q.type==="recall")return q.answer;
  if(q.type==="math"||q.type==="builder")return q.model;
  if(q.type==="mcq")return q.choices[q.correct];
  if(q.type==="numeric")return q.display;
  if(q.type==="writing")return q.model;
  if(q.type==="sketch")return "Compare the reference features, then hide them before the quick check.";
  return q.answer||q.model||"";
}
function reinforceFor(q){
  if(q.explain)return q.explain;
  const msgs={
    w1:"Keep the logic causal: the line tells you a photon energy, and discrete photon energies point back to discrete atomic energy levels.",
    w2:"The easy-to-miss phrase is ‘re-emitted in any direction’. That is why fewer photons continue towards the observer.",
    w3:"A thin line needs the extra link: one energy gap fixes one photon energy, therefore one frequency or wavelength.",
    w4:"Intensity changes the number of photons. It does not increase the energy hf of each photon.",
    w5:"Keep the chain short: V ↑ → p ↑ → λ ↓ → diffraction angle ↓ → rings closer."
  };
  return msgs[q.id]||"Focus on the cause-and-effect link, not the wording.";
}

function derivationHTML(q){
  if(!q.deriveSteps||!q.deriveSteps.length)return "";
  return `<div class="derivationBox">
    <div class="derivationTitle">Where this relation comes from</div>
    <div class="derivationSteps">`+
    q.deriveSteps.map((s,i)=>`
      <div class="deriveStep">
        <div class="deriveNum">${i+1}</div>
        <div class="deriveContent">
          <b>${s.title}</b>
          <div class="deriveMath">${s.math}</div>
          <div class="deriveWhy">${s.why}</div>
        </div>
      </div>${i<q.deriveSteps.length-1?'<div class="deriveArrow">↓</div>':''}`
    ).join("")+`</div></div>`;
}

function revealRevisionAnswer(){
  const q=current,answer=answerForRevision(q);
  let reference;
  if(q.type==="numeric" && q.steps){
    reference=`<div class="answerReveal" id="revealedAnswer"><div class="label">Worked solution</div><div class="calcSteps" id="calcSteps"></div></div>`;
  }else if(q.type==="builder" && q.deriveSteps){
    reference=`<div id="revealedAnswer">${derivationHTML(q)}<div class="answerReveal"><div class="label">Final relation</div><div class="answer">${answer}</div>${REVISE_REASONING[q.id]?`<div class="model" style="margin-top:12px">${REVISE_REASONING[q.id]}</div>`:""}</div></div>`;
  }else{
    const reasoning=REVISE_REASONING[q.id]?`<div class="model" style="margin-top:12px">${REVISE_REASONING[q.id]}</div>`:"";
    reference=`<div class="answerReveal" id="revealedAnswer"><div class="label">Answer</div><div class="answer">${answer}</div>${reasoning}</div>`;
  }
  if(q.type==="sketch")reference+=`<div id="sketchReference">${referenceSVG(q.modelKind)}</div>`;
  reference+=`<div class="revealControls">
    <button class="secondary" id="hideAnswer">Hide answer</button>
    <button class="primary" id="startQuick">I'm ready — quick check</button>
  </div>
  <div class="revisionHint">The quick check hides the answer automatically and should only take a few seconds.</div>
  <div id="quickHost"></div>`;
  $("#workspace").innerHTML=reference;
  if(q.type==="numeric"&&q.steps)buildCalcSteps(q);
  $("#hideAnswer").onclick=toggleRevealedAnswer;
  $("#startQuick").onclick=startQuickCheck;
}
function toggleRevealedAnswer(){
  const a=$("#revealedAnswer"),s=$("#sketchReference");
  const nowHidden=!a.classList.contains("hiddenAnswer");
  a.classList.toggle("hiddenAnswer",nowHidden);
  if(s)s.classList.toggle("hiddenAnswer",nowHidden);
  $("#hideAnswer").textContent=nowHidden?"Show answer":"Hide answer";
}
function startQuickCheck(){
  const a=$("#revealedAnswer"),s=$("#sketchReference");
  if(a)a.classList.add("hiddenAnswer");if(s)s.classList.add("hiddenAnswer");
  $("#hideAnswer").textContent="Show answer";
  renderQuickCheck(current);
}
function renderQuickCheck(q){
  const qc=QUICK_CHECKS[q.id],host=$("#quickHost");
  if(!qc){host.innerHTML=`<div class="quickResult good">No extra check for this card. Move on when ready.</div><div class="actionRow"><button class="primary" id="quickNext">Next prompt</button></div>`;$("#quickNext").onclick=next;return}
  let h=`<div class="quickCheck"><div class="quickLabel">Quick check</div><h3>${qc.q}</h3>`;
  if(qc.kind==="choice"){
    h+=`<div class="quickChoices" id="quickChoices">`+qc.options.map((x,i)=>`<button class="quickChoice" data-i="${i}">${x}</button>`).join("")+`</div><div class="actionRow"><button class="primary" id="checkQuick">Check</button></div>`;
  }else if(qc.kind==="multi"){
    h+=`<div class="checkList">`+qc.options.map((x,i)=>`<label class="checkItem"><input type="checkbox" value="${i}"><span>${x}</span></label>`).join("")+`</div><div class="actionRow"><button class="primary" id="checkQuick">Check</button></div>`;
  }else if(qc.kind==="order"){
    const shuffled=shuffle(qc.steps.map((x,i)=>({x,i})));
    h+=`<div class="orderHelp">Drag each idea into a numbered slot, or tap the ideas to place them in the next empty slot.</div>
       <div class="orderTarget" id="orderTarget"><div class="orderSlots" id="orderSlots"></div></div>
       <div class="orderBank" id="orderBank">`+
       shuffled.map(o=>`<button class="orderChip" draggable="true" data-i="${o.i}">${o.x}</button>`).join("")+
       `</div><div class="actionRow"><button class="secondary" id="clearOrder">Clear</button><button class="primary" id="checkQuick">Check order</button></div>`;
  }
  h+=`<div id="quickResult"></div></div>`;host.innerHTML=h;
  if(qc.kind==="choice"){
    host.querySelectorAll(".quickChoice").forEach(b=>b.onclick=()=>{host.querySelectorAll(".quickChoice").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
  }
  if(qc.kind==="order"){
    window.quickOrder=Array(qc.steps.length).fill(null);
    const draw=()=>{
      const slots=$("#orderSlots"),bank=$("#orderBank");slots.innerHTML="";
      quickOrder.forEach((stepIndex,pos)=>{
        const slot=document.createElement("div");slot.className="orderSlot";slot.dataset.pos=pos;
        slot.innerHTML=`<span class="slotNum">${pos+1}</span><span class="slotContent"></span>`;
        const content=slot.querySelector(".slotContent");
        if(stepIndex===null){
          content.textContent="Drop an idea here";
        }else{
          const chip=document.createElement("button");chip.className="orderChip";chip.textContent=qc.steps[stepIndex];
          chip.draggable=true;chip.dataset.i=stepIndex;
          chip.onclick=()=>{quickOrder[pos]=null;draw()};
          chip.ondragstart=e=>{e.dataTransfer.setData("text/plain",stepIndex);e.dataTransfer.setData("from-pos",pos)};
          content.innerHTML="";content.appendChild(chip);
        }
        slot.ondragover=e=>e.preventDefault();
        slot.ondrop=e=>{
          e.preventDefault();
          const i=Number(e.dataTransfer.getData("text/plain"));
          quickOrder=quickOrder.map(x=>x===i?null:x);
          quickOrder[pos]=i;draw();
        };
        slots.appendChild(slot);
        if(pos<qc.steps.length-1){
          const arrow=document.createElement("div");arrow.className="orderArrow";arrow.textContent="↓";slots.appendChild(arrow);
        }
      });
      bank.querySelectorAll(".orderChip").forEach(b=>{
        const i=Number(b.dataset.i);b.disabled=quickOrder.includes(i);
        b.onclick=()=>{
          if(quickOrder.includes(i))return;
          const pos=quickOrder.findIndex(x=>x===null);
          if(pos>=0){quickOrder[pos]=i;draw()}
        };
        b.ondragstart=e=>e.dataTransfer.setData("text/plain",i);
      });
    };
    $("#clearOrder").onclick=()=>{quickOrder=Array(qc.steps.length).fill(null);draw()};draw();
  }
  $("#checkQuick").onclick=()=>checkQuick(q,qc);
}

function quickHintFor(q,qc){
  if(qc.kind==="order")return "Start with the physical cause or event, then place the equation/energy relationship, then the observable consequence.";
  if(qc.kind==="multi")return "Choose only statements that are necessary scientific ideas, not merely related facts.";
  if(q.type==="math"||q.type==="numeric"||q.type==="builder")return "Go back to the revealed relationship and identify which quantities are fixed and which are changing.";
  if(q.type==="writing")return "Think in mark points: physical event → energy/relationship → consequence.";
  return "Use the physics relationship or mechanism from the reveal, then eliminate options that do not follow from it.";
}

function checkQuick(q,qc){
  let ok=false;
  if(qc.kind==="choice"){
    const sel=$("#quickHost .quickChoice.selected");if(!sel)return nudge();
    const i=Number(sel.dataset.i);ok=i===qc.answer;
    $("#quickHost").querySelectorAll(".quickChoice").forEach(b=>b.classList.remove("correct","wrong"));
    if(ok) sel.classList.add("correct"); else sel.classList.add("wrong");
  }else if(qc.kind==="multi"){
    const got=[...$("#quickHost").querySelectorAll('input[type="checkbox"]:checked')].map(x=>Number(x.value)).sort((a,b)=>a-b);
    const want=[...qc.answers].sort((a,b)=>a-b);ok=JSON.stringify(got)===JSON.stringify(want);
  }else if(qc.kind==="order"){
    if(!window.quickOrder||window.quickOrder.some(x=>x===null))return nudge();
    ok=window.quickOrder.every((x,i)=>x===i);
  }
  const r=$("#quickResult");
  if(!ok){
    const hint=qc.hint||quickHintFor(q,qc);
    r.innerHTML=`<div class="quickResult bad"><b>Not quite.</b> Have another go — the answer is still hidden.</div>
      <div class="actionRow"><button class="secondary hintBtn" id="hintBtn">Quick hint</button><button class="secondary" id="retryQuick">Try again</button></div>
      <div id="hintHost"></div>`;
    $("#hintBtn").onclick=()=>{$("#hintHost").innerHTML=`<div class="quickHint">💡 ${hint}</div>`;$("#hintBtn").disabled=true};
    $("#retryQuick").onclick=()=>{$("#quickResult").innerHTML=""; if(qc.kind==="choice")$("#quickHost").querySelectorAll(".quickChoice").forEach(b=>b.classList.remove("selected","wrong","correct"));};
    return;
  }
  if(!session.some(x=>x.id===q.id && x.reviseQuick)){
    session.push({id:q.id,topic:q.topic,type:q.type,correct:true,score:1,max:1,reviseQuick:true,time:new Date().toISOString()});
  }
  mastery[q.id]=3;localStorage.setItem("qr_mastery",JSON.stringify(mastery));
  celebrate();updateStats();
  r.innerHTML=`<div class="quickResult good"><b>Got it.</b> ${reinforceFor(q)}</div>
    <div class="actionRow"><button class="primary" id="quickNext">${index===queue.length-1?"Finish revision":"Next prompt"}</button><button class="secondary" id="quickAgain">See this card again soon</button></div>`;
  $("#quickNext").onclick=next;
  $("#quickAgain").onclick=()=>{mastery[q.id]=1;localStorage.setItem("qr_mastery",JSON.stringify(mastery));queue.splice(Math.min(queue.length,index+3),0,q);next()};
}
function revisionRetypeUI(q){
  if(q.type==="builder")return `<div class="retypeBox"><div class="label">Now rebuild it</div><div class="preview" id="eqTarget"></div><div class="tokenBank" id="tokenBank"></div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button><button class="secondary" id="clearBuild">Clear</button></div><div id="reviseFeedback"></div></div>`;
  if(q.type==="math")return `<div class="retypeBox"><div class="label">Now type the equation from memory</div><div class="mathToolbar" id="mathToolbar"></div><input id="retypeInput" type="text" spellcheck="false" placeholder="Type the equation"><div class="preview" id="mathPreview">…</div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button></div><div id="reviseFeedback"></div></div>`;
  if(q.type==="sketch")return `<div class="retypeBox"><div class="label">Now redraw it yourself</div><div class="canvasWrap"><canvas class="draw" id="drawCanvas"></canvas></div><div class="actionRow"><button class="primary" id="checkRetype">I have redrawn it</button><button class="secondary" id="clearCanvas">Clear</button></div><div id="reviseFeedback"></div></div>`;
  if(q.type==="mcq")return `<div class="retypeBox"><div class="label">Now explain it back</div><textarea id="retypeText" placeholder="In one or two sentences, explain the physics that makes this option correct."></textarea><div class="micro">The checker looks for the key causal idea, not exact wording.</div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button></div><div id="reviseFeedback"></div></div>`;
  if(q.type==="numeric")return `<div class="retypeBox"><div class="label">Now reproduce the key working</div><input id="retypeWork" type="text" placeholder="Equation → substitution → answer"><div class="reconstructHint">${q.workTarget||""}</div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button></div><div id="reviseFeedback"></div></div>`;
  if(q.type==="writing")return `<div class="retypeBox"><div class="label">Now reproduce the scoring chain</div><textarea id="retypeText" placeholder="Use short phrases or sentence stems — not the whole model answer."></textarea><div class="reconstructHint">${q.reconstruct||""}</div><div class="micro">You only need the key marking ideas, not a polished paragraph.</div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button></div><div id="reviseFeedback"></div></div>`;
  return `<div class="retypeBox"><div class="label">Now retype it from memory</div><textarea id="retypeText" placeholder="Look away from the answer and reproduce it here…"></textarea><div class="micro">Next stays locked until the key idea(s) are present.</div><div class="actionRow"><button class="primary" id="checkRetype">Check reconstruction</button></div><div id="reviseFeedback"></div></div>`;
}
function wireRevisionRetype(q){
  if(q.type==="builder"){
    q.tokens.forEach((tok,i)=>{const b=document.createElement("button");b.className="token";b.textContent=tok;b.onclick=()=>{builderState.push({i,t:tok});drawBuilder()};$("#tokenBank").appendChild(b)});
    $("#clearBuild").onclick=()=>{builderState=[];drawBuilder()};drawBuilder();
  }else if(q.type==="math"){
    ["Δ","E","h","f","p","λ","Φ","e","V","Vₛ","Eₖ,max","=","+","−","/","½","c","f₀"].forEach(t=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>insertMath(t,"#retypeInput");$("#mathToolbar").appendChild(b)});
    $("#retypeInput").oninput=()=>$("#mathPreview").innerHTML=formatMathPreview($("#retypeInput").value);
  }else if(q.type==="sketch"){setupCanvas();$("#clearCanvas").onclick=clearCanvas}
  $("#checkRetype").onclick=checkRevisionRetype;
}
function drawBuilder(){
  const t=$("#eqTarget");if(!t)return;t.innerHTML="";
  builderState.forEach((x,k)=>{const b=document.createElement("button");b.className="eqPiece";b.textContent=x.t;b.onclick=()=>{builderState.splice(k,1);drawBuilder()};t.appendChild(b)});
}
function insertMath(t,sel){
  const inp=$(sel),s=inp.selectionStart,e=inp.selectionEnd;
  if(t==="½"){
    const ins="\\frac{}{}";
    inp.value=inp.value.slice(0,s)+ins+inp.value.slice(e);
    inp.focus();inp.selectionStart=inp.selectionEnd=s+6;
  }else{
    inp.value=inp.value.slice(0,s)+t+inp.value.slice(e);
    inp.focus();inp.selectionStart=inp.selectionEnd=s+t.length;
  }
  inp.dispatchEvent(new Event("input"));
}
function checkRevisionRetype(){
  const q=current;let ok=false,score=0,max=1,feedback="";
  if(q.type==="recall"){
    const v=$("#retypeText").value.trim();if(!v)return nudge();
    score=keysScore(v,q.keyGroups);max=q.keyGroups.length;ok=score===max;feedback=`${score}/${max} key ideas present.`;
  }else if(q.type==="writing"){
    const v=$("#retypeText").value.trim();if(!v)return nudge();
    const hits=q.points.map(p=>p.keys.every(g=>groupHit(v,g)));score=hits.filter(Boolean).length;max=q.marks;ok=score===max;
    feedback=`${score}/${max} mark points present.`;
  }else if(q.type==="math"){
    const v=$("#retypeInput").value.trim();if(!v)return nudge();ok=q.accepted.some(a=>norm(a)===norm(v));score=ok?1:0;
  }else if(q.type==="builder"){
    const v=builderState.map(x=>x.t).join("");if(!v)return nudge();const sols=[q.solution,...(q.altSolutions||[])].map(x=>x.join(""));ok=sols.includes(v);score=ok?1:0;
  }else if(q.type==="numeric"){
    const v=$("#retypeWork").value.trim();if(v.length<8)return nudge();
    const compact=v.toLowerCase().replace(/\s/g,"");
    const numericMatches=(compact.match(/[0-9]/g)||[]).length>=3;
    const hasRelation=/=|→|->/.test(v);
    ok=numericMatches && hasRelation;score=ok?1:0;
  }else if(q.type==="mcq"){
    const v=$("#retypeText").value.trim();if(v.length<12)return nudge();
    const groups=q.explainKeys||[];
    const hits=groups.filter(g=>groupHit(v,g)).length;
    max=Math.max(1,groups.length);
    score=hits;
    ok=groups.length?hits===groups.length:v.length>=24;
  }else if(q.type==="sketch"){ok=true;score=1}
  const host=$("#reviseFeedback");
  if(!ok){
    const hint=q.type==="mcq"?"Your explanation is missing part of the key physics. Try to state the cause-and-effect link, not just repeat the option.":(feedback||"Your reconstruction does not yet match the target.");
    host.innerHTML=`<div class="feedback bad"><h3>Almost — try once more</h3><p>${hint}</p></div>`;
    return;
  }
  mastery[q.id]=3;localStorage.setItem("qr_mastery",JSON.stringify(mastery));
  session.push({id:q.id,topic:q.topic,type:q.type,correct:true,score,max,time:new Date().toISOString()});
  celebrate();
  host.innerHTML=`<div class="feedback good"><h3>Reconstructed ✓</h3><p>${feedback||"You reproduced the target successfully."}</p></div>
    <div class="reinforce"><div class="label">Lock this in</div><p>${reinforceFor(q)}</p></div>
    <div class="actionRow"><button class="primary" id="nextRevise">${index===queue.length-1?"Finish revision":"Next prompt"}</button><button class="secondary" id="rateNearly">I still need this again</button></div>`;
  $("#nextRevise").onclick=next;
  $("#rateNearly").onclick=()=>{mastery[q.id]=1;localStorage.setItem("qr_mastery",JSON.stringify(mastery));queue.splice(Math.min(queue.length,index+3),0,q);next()};
  updateStats();
}
function renderTest(){
  const q=current,w=$("#workspace");w.innerHTML=`<div class="testArea" id="testArea"></div><div class="actionRow" id="testActions"></div><div id="testFeedback"></div>`;
  const a=$("#testArea");
  if(q.type==="recall"||q.type==="writing"){a.innerHTML=`<textarea id="testText" placeholder="${q.type==="writing"?"Write as you would in the exam…":"Type from memory…"}"></textarea>`}
  else if(q.type==="numeric"){a.innerHTML=`<input id="testInput" type="text" inputmode="decimal" placeholder="Enter your answer"><div class="helper" style="margin-top:7px">Unit: ${q.unit}</div>`}
  else if(q.type==="math"){a.innerHTML=`<div class="mathToolbar" id="mathToolbar"></div><input id="testInput" type="text" spellcheck="false" placeholder="Type the equation"><div class="preview" id="mathPreview">…</div>`;["Δ","E","h","f","p","λ","Φ","e","V","Vₛ","Eₖ,max","=","+","−","/","½","c","f₀"].forEach(t=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>insertMath(t,"#testInput");$("#mathToolbar").appendChild(b)});$("#testInput").oninput=()=>$("#mathPreview").innerHTML=formatMathPreview($("#testInput").value)}
  else if(q.type==="builder"){a.innerHTML=`<div class="preview" id="eqTarget"></div><div class="tokenBank" id="tokenBank"></div>`;q.tokens.forEach((tok,i)=>{const b=document.createElement("button");b.className="token";b.textContent=tok;b.onclick=()=>{builderState.push({i,t:tok});drawBuilder()};$("#tokenBank").appendChild(b)});drawBuilder()}
  else if(q.type==="mcq"){const box=document.createElement("div");box.className="mcq";q.choices.forEach((c,i)=>{const b=document.createElement("button");b.textContent=String.fromCharCode(65+i)+". "+c;b.onclick=()=>{selectedMCQ=i;box.querySelectorAll("button").forEach(x=>x.classList.remove("sel"));b.classList.add("sel")};box.appendChild(b)});a.appendChild(box)}
  else if(q.type==="sketch"){a.innerHTML=`<div class="canvasWrap"><canvas class="draw" id="drawCanvas"></canvas></div><div class="actionRow"><button class="secondary" id="clearCanvas">Clear sketch</button></div>`;setupCanvas();$("#clearCanvas").onclick=clearCanvas}
  const b=document.createElement("button");b.className="primary";b.textContent="Submit answer";b.onclick=checkTest;$("#testActions").appendChild(b);
}
function checkTest(){
  const q=current;let result={correct:false,score:0,max:1},response="";
  if(q.type==="recall"){response=$("#testText").value.trim();if(!response)return nudge();result.max=q.keyGroups.length;result.score=keysScore(response,q.keyGroups);result.correct=result.score===result.max}
  else if(q.type==="writing"){response=$("#testText").value.trim();if(!response)return nudge();const hits=q.points.map(p=>p.keys.every(g=>groupHit(response,g)));result.hits=hits;result.max=q.marks;result.score=hits.filter(Boolean).length;result.correct=result.score===result.max}
  else if(q.type==="numeric"){response=$("#testInput").value.trim();const x=Number(response.replace(/×10\^?/g,"e").replace(/\s/g,""));if(!Number.isFinite(x))return nudge();result.correct=Math.abs((x-q.answer)/q.answer)<=q.tol;result.score=result.correct?1:0}
  else if(q.type==="math"){response=$("#testInput").value.trim();if(!response)return nudge();result.correct=q.accepted.some(a=>norm(a)===norm(response));result.score=result.correct?1:0}
  else if(q.type==="builder"){response=builderState.map(x=>x.t).join("");if(!response)return nudge();const sols=[q.solution,...(q.altSolutions||[])].map(x=>x.join(""));result.correct=sols.includes(response);result.score=result.correct?1:0}
  else if(q.type==="mcq"){if(selectedMCQ===null)return nudge();result.correct=selectedMCQ===q.correct;result.score=result.correct?1:0;document.querySelectorAll(".mcq button").forEach((b,i)=>{if(i===q.correct)b.classList.add("correct");if(i===selectedMCQ&&i!==q.correct)b.classList.add("wrong")})}
  else if(q.type==="sketch"){result.self=true;result.max=1}
  session.push({id:q.id,topic:q.topic,type:q.type,correct:result.correct,score:result.score,max:result.max,time:new Date().toISOString(),self:!!result.self});
  if(!result.self){if(result.correct){streak++;bestStreak=Math.max(bestStreak,streak);celebrate()}else streak=0}
  showTestFeedback(result);updateStats();
}
function showTestFeedback(r){
  const q=current,h=$("#testFeedback"),actions=$("#testActions");actions.innerHTML="";
  let cls=r.self?"":r.correct?"good":"bad",title=r.self?"Self-check your sketch":r.correct?"Correct ✓":`Not quite — ${r.score}/${r.max} mark points`;
  let html=`<div class="feedback ${cls}"><h3>${title}</h3>`;
  if(q.type==="writing"){html+=`<div class="markPoints">`+q.points.map((p,i)=>`<div class="markPoint ${r.hits[i]?"hit":""}"><span class="dot"></span><span>${p.label}</span></div>`).join("")+`</div><div class="model"><b>Model answer</b><br>${q.model}</div>`}
  else if(q.type==="recall")html+=`<div class="model"><b>Answer</b><br>${q.answer}</div>`;
  else if(q.type==="numeric")html+=`<div class="model"><b>Expected</b><br>${q.display}</div><p>${q.explain||""}</p>`;
  else if(q.type==="sketch")html+=referenceSVG(q.modelKind)+`<p>Compare your sketch with the reference before scoring yourself.</p>`;
  else{if(q.model)html+=`<div class="model"><b>Target</b><br>${q.model}</div>`;if(q.explain)html+=`<p>${q.explain}</p>`}
  html+=`</div>`;h.innerHTML=html;
  if(q.type==="sketch"){
    [["Doesn't match",false],["Matches",true]].forEach(([lab,val])=>{const b=document.createElement("button");b.className=val?"primary":"secondary";b.textContent=lab;b.onclick=()=>{const rec=session.at(-1);rec.correct=val;rec.score=val?1:0;rec.self=false;if(val){streak++;celebrate()}else streak=0;updateStats();next()};actions.appendChild(b)})
  }else{const b=document.createElement("button");b.className="primary";b.textContent=index===queue.length-1?"Finish test":"Next question";b.onclick=next;actions.appendChild(b)}
}
function next(){index++;render()}
function finish(){
  $("#progress").style.width="100%";$("#typeBadge").textContent="Complete";$("#topicBadge").textContent=mode==="revise"?"Revision":"Test";$("#counter").textContent=`${queue.length} / ${queue.length}`;
  $("#prompt").textContent=mode==="revise"?"Revision round complete":"Test complete";
  $("#subprompt").textContent=summaryLine();
  $("#workspace").innerHTML=`<div class="answerReveal"><div class="label">Session complete</div><div class="answer">${mode==="revise"?"You revealed, hid and actively checked the key ideas rather than just flipping through answers.":"You completed a mixed retrieval test."}</div></div><div class="actionRow"><button class="primary" id="again">Start another round</button><button class="secondary" id="summaryBtn">View summary</button></div>`;
  $("#again").onclick=buildQueue;$("#summaryBtn").onclick=openSummary;updateStats();
}
function summaryLine(){
  const rows=session.filter(x=>!x.self),e=rows.reduce((a,x)=>a+x.score,0),m=rows.reduce((a,x)=>a+x.max,0),p=m?Math.round(e/m*100):0;
  return mode==="test"?`${session.length} prompts completed · ${p}% mark-point accuracy · best streak ${bestStreak}.`:`${session.length} prompts completed · ${p}% mark-point accuracy.`;
}
function updateStats(){
  const rows=session.filter(x=>!x.self),e=rows.reduce((a,x)=>a+x.score,0),m=rows.reduce((a,x)=>a+x.max,0),p=m?Math.round(e/m*100):0;
  $("#accuracy").textContent=m?p+"%":"—";$("#answered").textContent=session.length;if(mode==="test")$("#streak").textContent=streak;
  const host=$("#topicStats");host.innerHTML="";
  topics().forEach(t=>{const r=rows.filter(x=>x.topic===t);if(!r.length)return;const ee=r.reduce((a,x)=>a+x.score,0),mm=r.reduce((a,x)=>a+x.max,0),pp=Math.round(ee/mm*100);const d=document.createElement("div");d.className="topicRow";d.innerHTML=`<div class="topicTop"><span>${t}</span><b>${pp}%</b></div><div class="bar"><i style="width:${pp}%"></i></div>`;host.appendChild(d)});
  if(!host.children.length)host.innerHTML=`<div class="helper">Results appear as you work.</div>`;
}
function openSummary(){$("#summaryText").textContent=summaryText();$("#summaryOverlay").hidden=false}
function summaryText(){
  const name=$("#studentName").value.trim()||"Student",rows=session.filter(x=>!x.self),e=rows.reduce((a,x)=>a+x.score,0),m=rows.reduce((a,x)=>a+x.max,0),pct=m?Math.round(e/m*100):0;
  const byTopic={};rows.forEach(r=>{byTopic[r.topic]??={e:0,m:0,n:0};byTopic[r.topic].e+=r.score;byTopic[r.topic].m+=r.max;byTopic[r.topic].n++});
  let s=`QUANTUM RETRIEVAL LAB — SESSION SUMMARY\n\nStudent: ${name}\nMode: ${mode==="revise"?"Revise":"Test"}\nDate: ${new Date().toLocaleString()}\nPrompts completed: ${session.length}\nOverall mark-point accuracy: ${pct}%\nBest streak: ${bestStreak}\n\nBY TOPIC\n`;
  Object.entries(byTopic).forEach(([k,v])=>s+=`• ${k}: ${Math.round(v.e/v.m*100)}% (${v.n} attempted)\n`);
  s+=`\nGenerated by Dr Pop Science — Quantum Retrieval Lab.`;
  return s;
}

async function makeShareGraphic(){
  const canvas=document.createElement("canvas");
  canvas.width=1080; canvas.height=1920; // 9:16 story/reel format
  const c=canvas.getContext("2d");
  const safe=72;
  const name=$("#studentName").value.trim()||"Quantum learner";
  const rows=session.filter(x=>!x.self),earned=rows.reduce((a,x)=>a+x.score,0),possible=rows.reduce((a,x)=>a+x.max,0);
  const pct=possible?Math.round(earned/possible*100):0;
  const byTopic={};rows.forEach(r=>{byTopic[r.topic]??={e:0,m:0};byTopic[r.topic].e+=r.score;byTopic[r.topic].m+=r.max});
  const topicRows=Object.entries(byTopic).map(([k,v])=>[k,Math.round(v.e/v.m*100)]).sort((a,b)=>b[1]-a[1]);

  const bg=c.createLinearGradient(0,0,1080,1920);
  bg.addColorStop(0,"#e8f7f3");bg.addColorStop(.46,"#eaf4ff");bg.addColorStop(1,"#fff4d9");
  c.fillStyle=bg;c.fillRect(0,0,1080,1920);

  // decorative shapes kept outside safe content area
  [["#ccefe6",95,145,105],["#cfe6ff",990,225,145],["#ffe9e4",975,920,80],["#c7bdf7",90,1640,92],["#ffd977",985,1740,115]]
    .forEach(([col,x,y,r])=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()});

  // inset main result card with generous margin
  roundRect(c,safe,safe,1080-safe*2,1920-safe*2,52);
  c.fillStyle="rgba(255,255,255,.94)";c.fill();

  const x=safe+64, right=1080-safe-64;
  c.fillStyle="#168f88";c.font="900 27px Arial";c.fillText("DR POP SCIENCE",x,175);
  c.fillStyle="#203442";c.font="900 63px Arial";c.fillText("Quantum",x,270);c.fillText("Retrieval Lab",x,340);
  c.fillStyle="#6b7f8e";c.font="700 26px Arial";c.fillText(`${mode==="revise"?"REVISION ROUND":"TEST MODE"}`,x,397);
  c.font="500 23px Arial";c.fillText(name,x,435);

  // score panel
  roundRect(c,x,500,right-x,405,36);c.fillStyle="#203442";c.fill();
  c.fillStyle="#ffffff";c.textAlign="center";c.font="900 148px Arial";c.fillText(`${pct}%`,540,700);
  c.font="800 27px Arial";c.fillText("ACCURACY",540,752);
  c.font="650 22px Arial";c.fillStyle="#c8d9e2";c.fillText(`${session.length} cards completed`,540,802);
  if(mode==="test"){c.fillStyle="#ffd977";c.font="850 25px Arial";c.fillText(`🔥 Best streak ${bestStreak}`,540,852)}
  else {c.fillStyle="#8ddcca";c.font="850 22px Arial";c.fillText("REVEAL · HIDE · QUICK CHECK",540,852)}
  c.textAlign="left";

  // Topic scorecard
  c.fillStyle="#203442";c.font="900 31px Arial";c.fillText("Topic scorecard",x,1005);
  let y=1070;
  const palette=["#168f88","#2f7cc0","#eaa51f","#9b83df"];
  (topicRows.length?topicRows:[["Complete a round to fill this in",0]]).slice(0,4).forEach(([topic,p],i)=>{
    c.fillStyle="#486473";c.font="750 23px Arial";c.fillText(topic,x,y);
    c.fillStyle="#edf3f5";roundRect(c,x,y+22,right-x,28,14);c.fill();
    c.fillStyle=palette[i%palette.length];roundRect(c,x,y+22,Math.max(12,(right-x)*p/100),28,14);c.fill();
    c.fillStyle="#203442";c.textAlign="right";c.font="900 23px Arial";c.fillText(`${p}%`,right,y);c.textAlign="left";
    y+=132;
  });

  // Game-like footer badge
  roundRect(c,x,1605,right-x,150,28);c.fillStyle="#f5fafb";c.fill();
  c.fillStyle="#168f88";c.font="900 25px Arial";c.fillText("⚛  QUANTUM TRAINING COMPLETE",x+34,1660);
  c.fillStyle="#6b7f8e";c.font="650 20px Arial";c.fillText("Cambridge International A Level Physics 9702",x+34,1703);
  c.fillStyle="#2f7cc0";c.font="800 21px Arial";c.fillText("Dr Pop Science · Quantum Flashcards",x+34,1739);

  c.fillStyle="#8597a1";c.font="600 18px Arial";c.fillText("Share your score · keep improving · beat your next round",x,1810);

  return new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
}
function roundRect(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
}
async function shareResultGraphic(){
  const blob=await makeShareGraphic();if(!blob)return;
  const name=($("#studentName").value.trim()||"student").replace(/[^a-z0-9_-]+/gi,"-").toLowerCase();
  const file=new File([blob],`quantum-retrieval-${name}.png`,{type:"image/png"});
  const text=`Quantum Retrieval Lab · ${mode==="revise"?"Revision":"Test"} · ${summaryLine()}`;
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({title:"Quantum Retrieval Lab result",text,files:[file]});return;
    }
    if(navigator.share){await navigator.share({title:"Quantum Retrieval Lab result",text});}
  }catch(e){if(e&&e.name==="AbortError")return}
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function emailSummary(){const n=$("#studentName").value.trim()||"Student";location.href=`mailto:${TEACHER}?subject=${encodeURIComponent("Quantum Retrieval Lab results — "+n)}&body=${encodeURIComponent(summaryText())}`}
function nudge(){const c=$("#card");c.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],{duration:220})}
function celebrate(){
  chime();$("#card").classList.remove("okPulse");void $("#card").offsetWidth;$("#card").classList.add("okPulse");
  const cols=["#168f88","#2f7cc0","#eaa51f","#f59a82","#c7bdf7"];
  for(let i=0;i<18;i++){const d=document.createElement("i");d.className="confetti";d.style.left=(35+Math.random()*35)+"vw";d.style.top=(8+Math.random()*12)+"vh";d.style.background=cols[i%cols.length];d.style.animationDelay=(Math.random()*120)+"ms";document.body.appendChild(d);setTimeout(()=>d.remove(),1200)}
}

/* ---------- mode-dependent soundtrack ---------- */
function chime(){
  try{
    const c=audioCtx||(audioCtx=new (window.AudioContext||window.webkitAudioContext)());
    [523.25,659.25,783.99].forEach((f,i)=>{
      const o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.value=f;
      const t=c.currentTime+i*.07;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.026,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
      o.connect(g).connect(c.destination);o.start(t);o.stop(t+.18);
    });
  }catch(e){}
}
function currentMusic(){return mode==="revise"?$("#reviseMusic"):$("#testMusic")}
function startMusic(){
  const a=currentMusic();if(!a)return;
  $("#reviseMusic").pause();$("#testMusic").pause();
  a.volume=.20;
  a.play().then(()=>updateMusicButtons(true)).catch(()=>updateMusicButtons(false));
}
function stopMusic(){
  ["#reviseMusic","#testMusic"].forEach(id=>{const a=$(id);if(a)a.pause()});
  updateMusicButtons(false);
}
function toggleMusic(){const a=currentMusic();if(!a)return;a.paused?startMusic():stopMusic()}
function updateMusicButtons(on){
  $("#musicBtn").textContent=on?"♫ Music on":"♫ Music off";
  $("#musicBtn").classList.toggle("on",on);
}
/* ---------- drawing ---------- */
function setupCanvas(){
  const c=$("#drawCanvas"),ctx=c.getContext("2d");
  function resize(){const r=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=r.width*dpr;c.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#203442";ctx.lineWidth=2.3}
  resize();drawing={c,ctx};let down=false;
  const pos=e=>{const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
  c.onpointerdown=e=>{down=true;const[x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y);c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{if(!down)return;const[x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke()};c.onpointerup=()=>down=false;c.onpointercancel=()=>down=false;
}
function clearCanvas(){if(!drawing)return;const r=drawing.c.getBoundingClientRect();drawing.ctx.clearRect(0,0,r.width,r.height)}
function referenceSVG(kind){
  if(kind==="photoGraph")return `<div class="model"><b>Reference sketch</b><br><svg viewBox="0 0 420 190" width="100%"><line x1="45" y1="150" x2="390" y2="150" stroke="#78909c"/><line x1="45" y1="150" x2="45" y2="20" stroke="#78909c"/><line x1="45" y1="150" x2="170" y2="150" stroke="#168f88" stroke-width="4"/><line x1="170" y1="150" x2="360" y2="42" stroke="#2f7cc0" stroke-width="4"/><text x="365" y="165" fill="#607d8b" font-size="13">f</text><text x="8" y="24" fill="#607d8b" font-size="13">Eₖ,max</text><text x="160" y="171" fill="#607d8b" font-size="12">f₀</text></svg></div>`;
  return `<div class="model"><b>Reference sketch</b><br><svg viewBox="0 0 420 190" width="100%"><line x1="70" y1="145" x2="350" y2="145" stroke="#516b79" stroke-width="3"/><line x1="70" y1="45" x2="350" y2="45" stroke="#516b79" stroke-width="3"/><line x1="150" y1="133" x2="150" y2="60" stroke="#168f88" stroke-width="4"/><polygon points="150,48 143,63 157,63" fill="#168f88"/><line x1="270" y1="58" x2="270" y2="130" stroke="#eaa51f" stroke-width="4"/><polygon points="270,142 263,127 277,127" fill="#eaa51f"/><text x="105" y="95" fill="#607d8b" font-size="13">absorb hf</text><text x="278" y="95" fill="#607d8b" font-size="13">emit hf</text></svg></div>`;
}
init();
