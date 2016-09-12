var skills = [
  [
    'React',
    'ES6+',
    'Node.js',
    'Redux'
  ],
  [
    'CSS Modules',
    'SASS',
    'Gulp',
    'jQuery',
    'HTML5 APIs'
  ],
  [
    'Rails',
    'MySQL/Postgres',
    'AWS (EC2, Lambda)',
    'Git',
    'Jasmine / Mocha'
  ],
  [
    'Sketch',
    'Adobe Creative Suite',
    'Cinema4D',
    'WebGL',
    'D3.js'
  ],
  [
    'React Native',
    'Phonegap / Cordova',
    'Objective-C',
    'Swift',
    'SceneKit / SpriteKit',
    'Xcode'
  ]
];

var orbitsContainer = $('section.orbits');

for (var i = 0; i < skills.length; i += 1) {  
  var orbitSkills = skills[i];

  var orbit = $('<section class="orbit"></section>');

  orbit.css({
    animationDuration: (i * 5) + 15 +'s',
  });

  for (var j = 0; j < orbitSkills.length; j += 1) {
    var skill = $('<code class="skill">'+orbitSkills[j]+'</code>');

    var rotation = 360 / orbitSkills.length * j;
    var distance = 80 + (i * 40);

    skill.css({
      transform: "translate(-50%, -50%) rotate("+rotation+"deg) translateY(-"+distance+"px)"
    });

    orbit.append(skill);
  }

  orbitsContainer.append(orbit);

  // arctext only works whilst in the DOM
  orbitsContainer.find('code.skill').each(function () {
    $(this).arctext({radius: (60 * i) + 60});
  });
}
