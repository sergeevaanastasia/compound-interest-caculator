const allInputs = document.querySelectorAll("input");
const startCapital = document.querySelector("#start-capital");
const years = document.querySelector("#years");
const monthlyContribution = document.querySelector("#monthly-contribution");
const interest = document.querySelector("#interest");
// const capitalizationAmount = document.querySelector("#capitalization-amount");
// const inflation = document.querySelector("#inflation");
const taxes = document.querySelector("#taxes");

const currencyButtons = document.querySelectorAll(".currency-buttons button");
const calcButton = document.querySelector(".calc-button");
const resetButton = document.querySelector(".reset-button");

const calcResults = document.querySelector(".calc-results");
const withoutTaxesDiv = document.querySelector(".without-taxes");

const results = document.querySelectorAll("[data-result]");
const totalInvestments = document.querySelector(
  "[data-result=total-investments]"
);
const totalAccumulation = document.querySelector(
  "[data-result=total-accumulation]"
);
const withoutTaxes = document.querySelector("[data-result=without-taxes]");

let regExpSeparator = /(\d)(?=(\d\d\d)+([^\d]|$))/g;

let resultTotalInvestments = 0;
let resultTotalAccumulation = 0;
let resultAccumulationWithoutTaxes = 0;

const ruble = "₽";
const dollar = "$";
const euro = "€";
let currency = ruble;

// for of?
allInputs.forEach((input) => input.addEventListener("input", validateValue));

allInputs.forEach((input) => input.addEventListener("input", setUnit));

// allInputs.forEach((input) =>
//   input.addEventListener("keydown", (event) => {
//     if (event.key === "Backspace") {
//       if (input === years) {
//         input.selectionStart = input.selectionEnd = input.value.replace(
//           /[^\d]/g,
//           ""
//         ).length;
//       } else {
//         input.selectionStart = input.selectionEnd = input.value.length - 2;
//       }
//     }
//   })
// );

// allInputs.forEach((input) =>
//   input.addEventListener("keydown", (event) => {
//     if (event.key === "Backspace") {
//       let cursor = input.selectionStart;
//       input.selectionStart = input.selectionEnd = cursor;

//       console.log("backspace");
//     }
//   })
// );

calcButton.addEventListener("click", calculateResults);
resetButton.addEventListener("click", resetValues);

function chooseCurrency() {
  currencyButtons[0].classList.add("active");

  currencyButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      clearCurrency();
      button.classList.add("active");

      changeCurrency();
    });
  });

  function clearCurrency() {
    currencyButtons.forEach((button) => button.classList.remove("active"));
  }
}

chooseCurrency();

function validateValue() {
  let validValue = this.value.replace(/[^\d]/g, "");
  // let cursor = this.selectionStart;

  if (this === years || this === interest || this === taxes) {
    if (Number(validValue) > 99) {
      validValue = "100";
    }
  } else if (this.value.length > 12) {
    validValue = validValue.slice(0, 12);
  }
  this.value = validValue.replace(regExpSeparator, "$1 ");
  // this.selectionStart = this.selectionEnd = cursor;
}

function setUnit() {
  let numValue = Number(this.value);
  let cursor = this.selectionStart;

  if (/[0-9]/.test(this.value)) {
    if (this === interest || this == taxes) {
      this.value += " %";
    } else if (this === startCapital || this === monthlyContribution) {
      this.value += " " + currency;
    } else if (this === years) {
      if (numValue % 10 === 1 && numValue % 100 !== 11) {
        this.value += " год";
      } else if (
        [2, 3, 4].includes(numValue % 10) &&
        ![12, 13, 14].includes(numValue % 100)
      ) {
        this.value += " года";
      } else {
        this.value += " лет";
      }
    }
  }

  this.selectionStart = this.selectionEnd = cursor;
}

function changeCurrency() {
  let currencyInputs = [startCapital, monthlyContribution];

  if (currencyButtons[0].classList.contains("active")) {
    startCapital.placeholder = "100 000 ₽";
    monthlyContribution.placeholder = "10 000 ₽";
    currency = ruble;
  } else if (currencyButtons[1].classList.contains("active")) {
    startCapital.placeholder = "100 000 $";
    monthlyContribution.placeholder = "10 000 $";
    currency = dollar;
  } else if (currencyButtons[2].classList.contains("active")) {
    startCapital.placeholder = "100 000 €";
    monthlyContribution.placeholder = "10 000 €";
    currency = euro;
  }

  for (let currencyInput of currencyInputs) {
    if (currencyInput) {
      currencyInput.value = currencyInput.value.replace(/.$/, currency);
    }
  }

  for (let result of results) {
    if (result) {
      result.textContent = result.textContent.replace(/.$/, currency);
    }
  }
}

function getValues() {
  for (let i = 0; i <= allInputs.length; i++) {}
  let allInputsValues = [...allInputs].map((input) =>
    Number(input.value.replace(/[^\d]/g, ""))
  );

  return (values = {
    startCapital: allInputsValues[0],
    years: allInputsValues[1],
    monthlyContribution: allInputsValues[2],
    interest: allInputsValues[3] / 100,
    // capitalizationAmount: allInputsValues[4],
    // inflation: allInputsValues[5] / 100,
    taxes: allInputsValues[4] / 100,
  });
}

function calculateResults() {
  getValues();

  // A = P * (1 + r / 12) ** (12*t)+ d * ((1 + r / 12) ** (12*t)- 1) / (r / 12)

  // А – итоговая сумма, которая будет получена
  // Р – изначальная сумма вклада
  // r – годовая процентная ставка
  // t – число лет, на которые оформлен вклад
  // d - сумма ежемесячного пополнения

  let currentAccumulation = values.startCapital;

  let periodFactor = (1 + values.interest / 12) ** 12;

  resultTotalInvestments =
    values.startCapital + values.monthlyContribution * 12 * values.years;

  // Сalculating the value of current accumulation without taxes
  if (values.taxes) {
    if (values.interest) {
      for (let i = 1; i <= values.years; i++) {
        let currentInvestments =
          currentAccumulation * periodFactor +
          (values.monthlyContribution * (periodFactor - 1)) /
            (values.interest / 12);

        let currentTaxes =
          (currentInvestments -
            (currentAccumulation + values.monthlyContribution * 12)) *
          values.taxes;

        currentAccumulation = currentInvestments - currentTaxes;
      }
      resultAccumulationWithoutTaxes = Math.round(currentAccumulation);
    } else {
      resultAccumulationWithoutTaxes = resultTotalInvestments;
    }
  }

  // Сalculating the value of accumulation with taxes
  if (!values.interest) {
    resultTotalAccumulation = resultTotalInvestments;
  } else {
    resultTotalAccumulation = Math.round(
      values.startCapital * periodFactor ** values.years +
        (values.monthlyContribution * (periodFactor ** values.years - 1)) /
          (values.interest / 12)
    );
  }

  showResults();
}

function showResults() {
  if (resultTotalInvestments >= 0) {
    calcResults.classList.remove("hide");
    totalInvestments.textContent =
      String(resultTotalInvestments).replace(regExpSeparator, "$1 ") +
      " " +
      currency;
  }
  if (resultTotalAccumulation >= 0) {
    totalAccumulation.textContent =
      String(resultTotalAccumulation).replace(regExpSeparator, "$1 ") +
      " " +
      currency;
  }
  if (values.taxes) {
    withoutTaxesDiv.classList.remove("hide");
    withoutTaxes.textContent =
      String(resultAccumulationWithoutTaxes).replace(regExpSeparator, "$1 ") +
      " " +
      currency;
  } else {
    withoutTaxesDiv.classList.add("hide");
  }

  wtfunction();
}

function resetValues() {
  allInputs.forEach((input) => (input.value = ""));
  calcResults.classList.add("hide");
}

function wtfunction() {
  if (String(resultTotalInvestments).length > 18) {
    let question = confirm("Вы Джеффри Безос?");

    if (question) {
      alert("Come on, Jeffrey! You can do it!");
    } else {
      alert("Чего балуешься, вводи свои настоящие бабке");
    }
  }
}
