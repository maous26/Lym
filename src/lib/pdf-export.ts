import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportWeeklyPlanToPDF(weeklyPlan: any, shoppingList?: any) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text('Plan Hebdomadaire', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' });

    let yPos = 40;

    // For each day
    weeklyPlan.days.forEach((day: any, dayIdx: number) => {
        if (dayIdx > 0) {
            doc.addPage();
            yPos = 20;
        }

        // Day title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(day.day, 20, yPos);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total: ${day.totalCalories} kcal`, 150, yPos);

        yPos += 10;

        // Meals table
        const tableData = day.meals.map((meal: any) => [
            meal.name,
            `${meal.calories} kcal`,
            `P: ${meal.proteins}g`,
            `G: ${meal.carbs}g`,
            `L: ${meal.fats}g`,
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Repas', 'Calories', 'Protéines', 'Glucides', 'Lipides']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [124, 58, 237] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Recipe details
        day.meals.forEach((meal: any) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(meal.name, 20, yPos);
            yPos += 6;

            doc.setFontSize(9);
            doc.setTextColor(100);

            // Ingredients
            doc.text('Ingrédients:', 20, yPos);
            yPos += 5;
            meal.ingredients.forEach((ing: string) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${ing}`, 25, yPos);
                yPos += 4;
            });

            yPos += 3;

            // Instructions
            doc.text('Instructions:', 20, yPos);
            yPos += 5;
            meal.instructions.forEach((inst: string, idx: number) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                const lines = doc.splitTextToSize(`${idx + 1}. ${inst}`, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 4;
            });

            yPos += 5;
        });
    });

    // Shopping list
    if (shoppingList) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Liste de Courses', 105, 20, { align: 'center' });

        yPos = 35;

        shoppingList.categories.forEach((category: any) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(category.name, 20, yPos);
            yPos += 6;

            doc.setFontSize(9);
            doc.setTextColor(100);

            category.items.forEach((item: string) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`☐ ${item}`, 25, yPos);
                yPos += 5;
            });

            yPos += 5;
        });
    }

    // Save
    doc.save(`plan-hebdomadaire-${new Date().toISOString().split('T')[0]}.pdf`);
}
