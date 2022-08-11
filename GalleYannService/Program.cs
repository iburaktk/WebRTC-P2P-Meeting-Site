var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

/*
// Connection string format: User Id=[username];Password=[password];Data Source=[hostname]:[port]/[DB service name];
OracleConnection con = new OracleConnection("User Id=SYS;Password=Burak03!;Data Source=localhost:1521/XEPDB1;");
con.Open();
OracleCommand cmd = con.CreateCommand();
cmd.CommandText = "SELECT \'Hello World!\' FROM dual";
 
OracleDataReader reader = cmd.ExecuteReader();
reader.Read();
Console.WriteLine(reader.GetString(0)); 
 * */