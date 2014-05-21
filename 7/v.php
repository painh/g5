<?php 
mysql_connect('localhost:/data/mysql/mysql.sock', 'painh');
mysql_select_db('painh_g5_5');

echo "<table>";
$ret = mysql_list_fields('painh_g5_7', 'record'); 
$cnt = mysql_num_fields($ret);
echo "<thead><tr>";

for($i = 0; $i < $cnt; ++$i)
{
	$field = mysql_field_name($ret, $i);
	echo "<th>$field</th>"; 
}
echo "</tr></thead>";
echo "<tbody>";

$query = "SELECT * FROM record";
$ret = mysql_query($query);
while($row = mysql_fetch_assoc($ret))
{
	echo "<tr>";

	foreach($row as $val)
		echo "<td>$val</td>"; 
}
echo "</tbody>";
echo "</table>";
