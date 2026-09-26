const fs = require('fs');

let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

c = c.replace(
  `            </div>
          )}
        </div>
      </div>
    </div>
  );
}`,
  `            </div>
          )}
        </div>
      </div>
  );
}`
);

fs.writeFileSync('src/pages/SalaryPage.tsx', c);
console.log('Removed extra div');
