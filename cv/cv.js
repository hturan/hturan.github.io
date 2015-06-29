var skills = [
  [
    'React',
    'ES6+',
    'Node.js'
  ],
  [
    'Handlebars',
    'SASS',
    'Gulp',
    'jQuery'
  ],
  [
    'Rails',
    'MySQL',
    'AWS (EC2, Lambda)',
    'Git',
    'Jasmine / Mocha'
  ],
  [
    'Sketch',
    'Photoshop',
    'Illustrator',
    'Cinema4D',
    'WebGL',
    'D3.js'
  ],
  [
    'React Native',
    'Objective-C',
    'Xcode',
    'Phonegap / Cordova'
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

  // arctext only works in the DOM
  orbitsContainer.find('code.skill').each(function () {
    $(this).arctext({radius: (60 * i)+80});
  });
}